import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * SQLite database wrapper.
 *
 * The DB file lives at server/data/campigir.db. On first boot we create the
 * schema and seed the `experiences` table from static/db.json so the content
 * stays editable in one place. Bookings are stored in the `bookings` table.
 */
const DB_PATH = join(__dirname, "data", "campigir.db");
const SEED_PATH = join(__dirname, "..", "static", "db.json");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS experiences (
    id           TEXT PRIMARY KEY,
    href         TEXT,
    image_src    TEXT,
    image_alt    TEXT,
    type         TEXT NOT NULL,
    title_pt     TEXT NOT NULL,
    title_en     TEXT NOT NULL,
    duration     TEXT,
    price        TEXT,
    price_per_hour TEXT,
    per_day      INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_id TEXT NOT NULL,
    kind          TEXT NOT NULL,
    date          TEXT NOT NULL,
    time          TEXT,
    count         INTEGER NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    total         REAL NOT NULL,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    notes         TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (experience_id) REFERENCES experiences(id)
  );

  CREATE TABLE IF NOT EXISTS blackouts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_id TEXT NOT NULL,
    date          TEXT NOT NULL,
    reason        TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (experience_id, date),
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
  );
`);

/**
 * Lightweight column migrations. `CREATE TABLE IF NOT EXISTS` never adds
 * columns to an existing table, so we add any missing ones manually. This
 * keeps older DB files working after upgrades.
 */
function ensureColumns(table, columns) {
  const existing = new Set(
    db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name),
  );
  for (const [name, def] of columns) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
    }
  }
}

try {
  ensureColumns("experiences", [
    ["capacity", "INTEGER NOT NULL DEFAULT 10"],
    ["active", "INTEGER NOT NULL DEFAULT 1"],
    ["description_pt", "TEXT"],
    ["description_en", "TEXT"],
    ["location", "TEXT"],
    ["sort_order", "INTEGER NOT NULL DEFAULT 0"],
    ["pricing", "TEXT"],
  ]);
  ensureColumns("bookings", [["period", "TEXT"]]);
} catch (err) {
  console.error("[db] Migration failed:", err.message);
}

/** Seed experiences from static/db.json if the table is empty. */
function seedExperiences() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM experiences").get();
  if (count > 0 || !existsSync(SEED_PATH)) return;

  const raw = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
  const rows = raw.experiences ?? [];
  const insert = db.prepare(`
    INSERT INTO experiences
      (id, href, image_src, image_alt, type, title_pt, title_en, duration,
       price, price_per_hour, per_day, capacity, active, sort_order)
    VALUES
      (@id, @href, @image_src, @image_alt, @type, @title_pt, @title_en, @duration,
       @price, @price_per_hour, @per_day, @capacity, @active, @sort_order)
  `);
  const tx = db.transaction((items) => {
    items.forEach((e, i) => {
      insert.run({
        id: e.id,
        href: e.href ?? null,
        image_src: e.imageSrc ?? null,
        image_alt: e.imageAlt ?? null,
        type: e.type,
        title_pt: e.title?.pt ?? "",
        title_en: e.title?.en ?? "",
        duration: e.duration ?? null,
        price: e.price ?? null,
        price_per_hour: e.pricePerHour ?? null,
        per_day: e.perDay ? 1 : 0,
        capacity: e.capacity ?? 10,
        active: 1,
        sort_order: i,
      });
    });
  });
  tx(rows);
  console.log(`Seeded ${rows.length} experiences from db.json`);
}

try {
  seedExperiences();
} catch (err) {
  console.error("[db] Seed failed:", err.message);
}

/**
 * Recreational-equipment rentals with tiered pricing (2h, daily, 24h,
 * 3 days, 5 days, 1 week). Seeded idempotently: only inserts rows whose id
 * doesn't exist yet, so it's safe on every boot and never overwrites edits.
 */
const EQUIPMENT_RENTALS = [
  { title: "Fato de Surf", en: "Wetsuit", h2: 7, daily: 12, d1: 14, d3: 36, d5: 60, week: 85, stock: 38, img: "https://contents.mediadecathlon.com/p2401588/k$8ff7a5e01e7f75a4583eae8cf498808c/picture.jpg" },
  { title: "Prancha Soft", en: "Soft Board", h2: 10, daily: 14, d1: 18, d3: 48, d5: 78, week: 110, stock: 12, img: "https://contents.mediadecathlon.com/p2574582/k$a8272a4c4b7026a40d690298cc9a3026/picture.jpg?format=auto&f=3000x0" },
  { title: "Prancha Epoxy", en: "Epoxy Board", h2: 12, daily: 18, d1: 22, d3: 58, d5: 90, week: 120, stock: 11, img: "https://www.mundo-surf.com/54892/prancha-de-surf-torq-comp-2-tec-epoxy.jpg" },
  { title: "Fato de Surf + Prancha Soft", en: "Wetsuit + Soft Board", h2: 12, daily: 19, d1: 26, d3: 66, d5: 102, week: 138, stock: 10, img: "https://i.postimg.cc/1X48GrK9/Whats-App-Image-2026-06-30-at-12-25-17.jpg" },
  { title: "Fato de Surf + Prancha Epoxy", en: "Wetsuit + Epoxy Board", h2: 14, daily: 22, d1: 30, d3: 78, d5: 114, week: 150, stock: 10, img: "https://i.postimg.cc/1X48GrK9/Whats-App-Image-2026-06-30-at-12-25-17.jpg" },
  { title: "SUP", en: "SUP", h2: 20, daily: 40, d1: 50, d3: 120, d5: 150, week: 180, stock: 3, img: "https://i.postimg.cc/T1hKVJcT/Whats-App-Image-2026-06-30-at-12-25-07.jpg" },
  { title: "SUP + Fato de Surf", en: "SUP + Wetsuit", h2: 25, daily: 45, d1: 55, d3: 135, d5: 180, week: 220, stock: 3, img: "https://i.ebayimg.com/images/g/n5cAAOSwKZ1hNzOy/s-l1600.webp" },
  { title: "Bodyboard", en: "Bodyboard", h2: 5, daily: 10, d1: 12, d3: 30, d5: 42, week: 48, stock: 10, img: "https://contents.mediadecathlon.com/p2411303/k$6b04831c5a65817c93c33e3e7a931e39/picture.jpg" },
  { title: "Pés de Pato", en: "Fins", h2: 4, daily: 8, d1: 12, d3: 30, d5: 42, week: 48, stock: 20, img: "https://www.mundo-surf.com/img/cms/blog/cuidar%20neopreno/swim_fin_bodyboard%20mundo%20surf.webp" },
  { title: "Fato de Surf + Pés de Pato + Bodyboard", en: "Wetsuit + Fins + Bodyboard", h2: 12, daily: 19, d1: 24, d3: 66, d5: 102, week: 132, stock: 10, img: "https://www.minhabcimoveis.com.br/assets/upload/noticias/152/bodyboard-1690915345604.png" },
  { title: "Skate", en: "Skate", h2: 5, daily: 10, d1: 12, d3: 30, d5: 48, week: 66, stock: 11, img: "https://i.postimg.cc/QCVFQJqx/Whats-App-Image-2026-06-30-at-12-25-56.jpg" },
  { title: "Bicicleta Modelo Praia", en: "Beach Bicycle", h2: 10, daily: 12, d1: 16, d3: 40, d5: 65, week: 80, stock: 18, img: "https://i.postimg.cc/J0tsN5Qm/Whats-App-Image-2026-06-30-at-12-24-25.jpg" },
  { title: "Suporte de Prancha / Cadeira de Criança", en: "Board Rack / Child Seat", h2: 3, daily: 4, d1: 6, d3: 12, d5: 18, week: 25, stock: 1, img: "https://i.postimg.cc/Y0VhbLXR/Whats-App-Image-2026-06-30-at-12-29-26.jpg" },
  { title: "Scooter 50cc", en: "50cc Scooter", h2: 15, daily: 25, d1: 30, d3: 75, d5: 110, week: 150, stock: 4, img: "https://i.postimg.cc/YqhFYMXF/Creativconteudo-31.jpg" },
  { title: "Capacete Extra", en: "Extra Helmet", h2: 2, daily: 3, d1: 5, d3: 12, d5: 15, week: 20, stock: 10, img: "https://i.postimg.cc/kGD2Qvyv/Whats-App-Image-2026-06-30-at-12-28-33.jpg" },
];

function seedEquipmentRentals() {
  const insert = db.prepare(`
    INSERT INTO experiences
      (id, href, image_src, image_alt, type, title_pt, title_en, duration,
       price, price_per_hour, per_day, capacity, active, description_pt,
       description_en, location, sort_order, pricing)
    VALUES
      (@id, @href, @image_src, @image_alt, @type, @title_pt, @title_en, @duration,
       @price, @price_per_hour, @per_day, @capacity, @active, @description_pt,
       @description_en, @location, @sort_order, @pricing)
  `);
  const baseOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM experiences")
    .get().m;
  let inserted = 0;
  const tx = db.transaction(() => {
    EQUIPMENT_RENTALS.forEach((e, i) => {
      const id = slugify(e.title);
      if (db.prepare("SELECT 1 FROM experiences WHERE id = ?").get(id)) return;
      const pricing = {
        h2: e.h2,
        daily: e.daily,
        d1: e.d1,
        d3: e.d3,
        d5: e.d5,
        week: e.week,
      };
      insert.run({
        id,
        href: null,
        image_src: e.img ?? null,
        image_alt: e.title,
        type: "rental",
        title_pt: e.title,
        title_en: e.en,
        duration: "24",
        price: String(e.d1),
        price_per_hour: String((e.h2 / 2).toFixed(2)),
        per_day: 1,
        capacity: e.stock,
        active: 1,
        description_pt: null,
        description_en: null,
        location: "Equipamento Recreativo",
        sort_order: baseOrder + 1 + i,
        pricing: JSON.stringify(pricing),
      });
      inserted++;
    });
  });
  tx();
  if (inserted) console.log(`Seeded ${inserted} equipment rentals`);
}

/**
 * Backfill/refresh the image for each seeded rental. Runs every boot so that
 * existing databases (created before images were added) get their pictures,
 * but only sets an image when the row is currently missing one.
 */
function updateRentalImages() {
  const upd = db.prepare(
    "UPDATE experiences SET image_src = @img WHERE id = @id AND (image_src IS NULL OR image_src = '')",
  );
  const tx = db.transaction(() => {
    EQUIPMENT_RENTALS.forEach((e) => {
      if (!e.img) return;
      upd.run({ id: slugify(e.title), img: e.img });
    });
  });
  tx();
}

try {
  seedEquipmentRentals();
  updateRentalImages();
} catch (err) {
  console.error("[db] Equipment seed failed:", err.message);
}

/** Map a DB row back into the frontend Experience shape. */
function rowToExperience(r) {
  return {
    id: r.id,
    href: r.href,
    imageSrc: r.image_src,
    imageAlt: r.image_alt,
    type: r.type,
    title: { pt: r.title_pt, en: r.title_en },
    description: { pt: r.description_pt ?? "", en: r.description_en ?? "" },
    location: r.location ?? "",
    duration: r.duration,
    price: r.price,
    capacity: r.capacity,
    active: !!r.active,
    sortOrder: r.sort_order,
    pricing: parsePricing(r.pricing),
    ...(r.price_per_hour ? { pricePerHour: r.price_per_hour } : {}),
    ...(r.per_day ? { perDay: true } : {}),
  };
}

/** Safely parse the pricing JSON column into an object (or null). */
function parsePricing(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Public listing: only active experiences, ordered. */
export function getExperiences() {
  const rows = db
    .prepare(
      "SELECT * FROM experiences WHERE active = 1 ORDER BY sort_order, title_pt",
    )
    .all();
  return rows.map(rowToExperience);
}

/** Admin listing: every experience regardless of active state. */
export function getAllExperiences() {
  const rows = db
    .prepare("SELECT * FROM experiences ORDER BY sort_order, title_pt")
    .all();
  return rows.map(rowToExperience);
}

export function getExperience(id) {
  const row = db.prepare("SELECT * FROM experiences WHERE id = ?").get(id);
  return row ? rowToExperience(row) : null;
}

/** Turn a title into a URL-safe slug for use as an id. */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Generate a unique experience id from a title. */
function uniqueId(base) {
  const root = slugify(base) || "experiencia";
  let id = root;
  let n = 1;
  while (db.prepare("SELECT 1 FROM experiences WHERE id = ?").get(id)) {
    id = `${root}-${++n}`;
  }
  return id;
}

/** Create a new experience/rental. Returns the created row. */
export function createExperience(input) {
  const id =
    input.id && !getExperience(input.id)
      ? input.id
      : uniqueId(input.title?.pt || input.title?.en || "experiencia");
  const maxOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM experiences")
    .get().m;
  db.prepare(`
    INSERT INTO experiences
      (id, href, image_src, image_alt, type, title_pt, title_en, duration,
       price, price_per_hour, per_day, capacity, active, description_pt,
       description_en, location, sort_order, pricing)
    VALUES
      (@id, @href, @image_src, @image_alt, @type, @title_pt, @title_en, @duration,
       @price, @price_per_hour, @per_day, @capacity, @active, @description_pt,
       @description_en, @location, @sort_order, @pricing)
  `).run({
    id,
    href: input.href ?? null,
    image_src: input.imageSrc ?? null,
    image_alt: input.imageAlt ?? input.title?.pt ?? null,
    type: input.type === "rental" ? "rental" : "experience",
    title_pt: input.title?.pt ?? "",
    title_en: input.title?.en ?? input.title?.pt ?? "",
    duration: input.duration ?? null,
    price: input.price ?? null,
    price_per_hour: input.pricePerHour ?? null,
    per_day: input.perDay ? 1 : 0,
    capacity: Number.isFinite(+input.capacity) ? +input.capacity : 10,
    active: input.active === false ? 0 : 1,
    description_pt: input.description?.pt ?? null,
    description_en: input.description?.en ?? null,
    location: input.location ?? null,
    sort_order: maxOrder + 1,
    pricing: input.pricing ? JSON.stringify(input.pricing) : null,
  });
  return getExperience(id);
}

/** Update an existing experience. Returns the row or null if not found. */
export function updateExperience(id, input) {
  const current = db.prepare("SELECT * FROM experiences WHERE id = ?").get(id);
  if (!current) return null;
  db.prepare(`
    UPDATE experiences SET
      href = @href, image_src = @image_src, image_alt = @image_alt,
      type = @type, title_pt = @title_pt, title_en = @title_en,
      duration = @duration, price = @price, price_per_hour = @price_per_hour,
      per_day = @per_day, capacity = @capacity, active = @active,
      description_pt = @description_pt, description_en = @description_en,
      location = @location, sort_order = @sort_order, pricing = @pricing
    WHERE id = @id
  `).run({
    id,
    href: input.href ?? current.href,
    image_src: input.imageSrc ?? current.image_src,
    image_alt: input.imageAlt ?? current.image_alt,
    type: input.type ?? current.type,
    title_pt: input.title?.pt ?? current.title_pt,
    title_en: input.title?.en ?? current.title_en,
    duration: input.duration ?? current.duration,
    price: input.price ?? current.price,
    price_per_hour:
      input.pricePerHour !== undefined
        ? input.pricePerHour
        : current.price_per_hour,
    per_day:
      input.perDay !== undefined ? (input.perDay ? 1 : 0) : current.per_day,
    capacity:
      input.capacity !== undefined ? +input.capacity : current.capacity,
    active:
      input.active !== undefined ? (input.active ? 1 : 0) : current.active,
    description_pt:
      input.description?.pt !== undefined
        ? input.description.pt
        : current.description_pt,
    description_en:
      input.description?.en !== undefined
        ? input.description.en
        : current.description_en,
    location: input.location !== undefined ? input.location : current.location,
    sort_order:
      input.sortOrder !== undefined ? +input.sortOrder : current.sort_order,
    pricing:
      input.pricing !== undefined
        ? input.pricing
          ? JSON.stringify(input.pricing)
          : null
        : current.pricing,
  });
  return getExperience(id);
}

/** Delete an experience (and its blackouts via cascade). */
export function deleteExperience(id) {
  const info = db.prepare("DELETE FROM experiences WHERE id = ?").run(id);
  return info.changes > 0;
}

export function createBooking(payload) {
  const stmt = db.prepare(`
    INSERT INTO bookings
      (experience_id, kind, date, time, count, quantity, total, name, email, phone, notes, period)
    VALUES
      (@experience_id, @kind, @date, @time, @count, @quantity, @total, @name, @email, @phone, @notes, @period)
  `);
  const info = stmt.run({ period: null, ...payload });
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(info.lastInsertRowid);
}

export function listBookings() {
  return db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
}

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

/** Update a booking's status. Returns the updated row or null if not found. */
export function updateBookingStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }
  const info = db
    .prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .run(status, id);
  if (info.changes === 0) return null;
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
}

/** Delete a booking. Returns true if a row was removed. */
export function deleteBooking(id) {
  const info = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  return info.changes > 0;
}

/* ------------------------------------------------------------------ */
/* Calendar / availability                                            */
/* ------------------------------------------------------------------ */

/** How many "units" a booking consumes on its day (people or rented units). */
function bookingLoad(b) {
  return b.kind === "rental" ? b.quantity : b.count;
}

/** True if a date is manually blocked for an experience. */
export function isBlackout(experienceId, date) {
  return !!db
    .prepare("SELECT 1 FROM blackouts WHERE experience_id = ? AND date = ?")
    .get(experienceId, date);
}

/** Sum of active bookings' load for an experience on a given date. */
export function bookedOnDate(experienceId, date) {
  const rows = db
    .prepare(
      `SELECT kind, count, quantity FROM bookings
       WHERE experience_id = ? AND date = ? AND status != 'cancelled'`,
    )
    .all(experienceId, date);
  return rows.reduce((sum, b) => sum + bookingLoad(b), 0);
}

/**
 * Remaining capacity for an experience on a date. Returns blocked=true and
 * remaining=0 when the day is blacked out or the experience is inactive.
 * Returns null when the experience does not exist.
 */
export function availabilityFor(experienceId, date) {
  const exp = db
    .prepare("SELECT capacity, active FROM experiences WHERE id = ?")
    .get(experienceId);
  if (!exp) return null;
  const booked = bookedOnDate(experienceId, date);
  const blocked = !exp.active || isBlackout(experienceId, date);
  return {
    capacity: exp.capacity,
    booked,
    remaining: blocked ? 0 : Math.max(0, exp.capacity - booked),
    blocked,
  };
}

/**
 * Per-day availability for a date range (inclusive), used by the admin
 * calendar and the public booking widget.
 */
export function availabilityRange(experienceId, from, to) {
  const exp = db
    .prepare("SELECT capacity, active FROM experiences WHERE id = ?")
    .get(experienceId);
  if (!exp) return null;

  const blocked = new Set(
    db
      .prepare(
        "SELECT date FROM blackouts WHERE experience_id = ? AND date BETWEEN ? AND ?",
      )
      .all(experienceId, from, to)
      .map((r) => r.date),
  );
  const bookedRows = db
    .prepare(
      `SELECT date, kind, count, quantity FROM bookings
       WHERE experience_id = ? AND date BETWEEN ? AND ? AND status != 'cancelled'`,
    )
    .all(experienceId, from, to);
  const bookedByDate = {};
  for (const b of bookedRows) {
    bookedByDate[b.date] = (bookedByDate[b.date] ?? 0) + bookingLoad(b);
  }

  const days = [];
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const isBlocked = !exp.active || blocked.has(iso);
    const booked = bookedByDate[iso] ?? 0;
    days.push({
      date: iso,
      capacity: exp.capacity,
      booked,
      remaining: isBlocked ? 0 : Math.max(0, exp.capacity - booked),
      blocked: isBlocked,
    });
  }
  return days;
}

/** List blackout dates for an experience (or all when omitted). */
export function listBlackouts(experienceId) {
  if (experienceId) {
    return db
      .prepare("SELECT * FROM blackouts WHERE experience_id = ? ORDER BY date")
      .all(experienceId);
  }
  return db.prepare("SELECT * FROM blackouts ORDER BY date").all();
}

/** Block a date for an experience (idempotent). */
export function addBlackout(experienceId, date, reason) {
  db.prepare(
    `INSERT INTO blackouts (experience_id, date, reason)
     VALUES (?, ?, ?)
     ON CONFLICT (experience_id, date) DO UPDATE SET reason = excluded.reason`,
  ).run(experienceId, date, reason ?? null);
  return db
    .prepare("SELECT * FROM blackouts WHERE experience_id = ? AND date = ?")
    .get(experienceId, date);
}

/** Remove a blackout. Returns true if a row was removed. */
export function removeBlackout(experienceId, date) {
  const info = db
    .prepare("DELETE FROM blackouts WHERE experience_id = ? AND date = ?")
    .run(experienceId, date);
  return info.changes > 0;
}

/** Aggregate stats for the admin dashboard. */
export function getStats() {
  const totals = db
    .prepare(
      "SELECT COUNT(*) AS bookings, COALESCE(SUM(total), 0) AS revenue FROM bookings",
    )
    .get();
  const revenueConfirmed = db
    .prepare(
      "SELECT COALESCE(SUM(total), 0) AS r FROM bookings WHERE status IN ('confirmed','completed')",
    )
    .get().r;
  const byStatusRows = db
    .prepare("SELECT status, COUNT(*) AS count FROM bookings GROUP BY status")
    .all();
  const byStatus = {};
  for (const s of VALID_STATUSES) byStatus[s] = 0;
  for (const row of byStatusRows) byStatus[row.status] = row.count;
  const experiences = db
    .prepare("SELECT COUNT(*) AS c FROM experiences WHERE active = 1")
    .get().c;
  return {
    bookings: totals.bookings,
    revenue: totals.revenue,
    revenueConfirmed,
    experiences,
    byStatus,
  };
}


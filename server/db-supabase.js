import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, "..", "static", "db.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Configure both env vars.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

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

function parsePricing(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function must(query) {
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

async function seedExperiencesIfEmpty() {
  const { count } = await must(
    supabase.from("experiences").select("id", { count: "exact", head: true }),
  );
  if ((count ?? 0) > 0) return;
  if (!existsSync(SEED_PATH)) return;

  const raw = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
  const rows = (raw.experiences ?? []).map((e, i) => ({
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
    per_day: !!e.perDay,
    capacity: e.capacity ?? 10,
    active: true,
    sort_order: i,
    description_pt: null,
    description_en: null,
    location: null,
    pricing: null,
  }));

  if (rows.length) {
    await must(supabase.from("experiences").upsert(rows, { onConflict: "id" }));
  }
}

async function seedEquipmentRentals() {
  const { data: existing } = await must(supabase.from("experiences").select("id"));
  const existingIds = new Set((existing ?? []).map((r) => r.id));

  const { data: maxRow } = await must(
    supabase
      .from("experiences")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1),
  );
  const baseOrder = maxRow?.[0]?.sort_order ?? 0;

  const toInsert = [];
  EQUIPMENT_RENTALS.forEach((e, i) => {
    const id = slugify(e.title);
    if (existingIds.has(id)) return;
    toInsert.push({
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
      per_day: true,
      capacity: e.stock,
      active: true,
      description_pt: null,
      description_en: null,
      location: "Equipamento Recreativo",
      sort_order: baseOrder + i + 1,
      pricing: { h2: e.h2, daily: e.daily, d1: e.d1, d3: e.d3, d5: e.d5, week: e.week },
    });
  });

  if (toInsert.length) {
    await must(supabase.from("experiences").insert(toInsert));
    console.log(`Seeded ${toInsert.length} equipment rentals`);
  }
}

await seedExperiencesIfEmpty();
await seedEquipmentRentals();

export async function getExperiences() {
  const { data } = await must(
    supabase
      .from("experiences")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("title_pt", { ascending: true }),
  );
  return (data ?? []).map(rowToExperience);
}

export async function getAllExperiences() {
  const { data } = await must(
    supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("title_pt", { ascending: true }),
  );
  return (data ?? []).map(rowToExperience);
}

export async function getExperience(id) {
  const { data } = await must(
    supabase.from("experiences").select("*").eq("id", id).maybeSingle(),
  );
  return data ? rowToExperience(data) : null;
}

async function uniqueId(base) {
  const root = slugify(base) || "experiencia";
  let id = root;
  let n = 1;
  while (await getExperience(id)) id = `${root}-${++n}`;
  return id;
}

export async function createExperience(input) {
  const id =
    input.id && !(await getExperience(input.id))
      ? input.id
      : await uniqueId(input.title?.pt || input.title?.en || "experiencia");

  const { data: maxRow } = await must(
    supabase
      .from("experiences")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1),
  );
  const maxOrder = maxRow?.[0]?.sort_order ?? 0;

  await must(
    supabase.from("experiences").insert({
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
      per_day: !!input.perDay,
      capacity: Number.isFinite(+input.capacity) ? +input.capacity : 10,
      active: input.active === false ? false : true,
      description_pt: input.description?.pt ?? null,
      description_en: input.description?.en ?? null,
      location: input.location ?? null,
      sort_order: maxOrder + 1,
      pricing: input.pricing ?? null,
    }),
  );

  return getExperience(id);
}

export async function updateExperience(id, input) {
  const current = await getExperience(id);
  if (!current) return null;

  await must(
    supabase
      .from("experiences")
      .update({
        href: input.href ?? current.href,
        image_src: input.imageSrc ?? current.imageSrc,
        image_alt: input.imageAlt ?? current.imageAlt,
        type: input.type ?? current.type,
        title_pt: input.title?.pt ?? current.title.pt,
        title_en: input.title?.en ?? current.title.en,
        duration: input.duration ?? current.duration,
        price: input.price ?? current.price,
        price_per_hour:
          input.pricePerHour !== undefined
            ? input.pricePerHour
            : current.pricePerHour ?? null,
        per_day: input.perDay !== undefined ? !!input.perDay : !!current.perDay,
        capacity: input.capacity !== undefined ? +input.capacity : current.capacity,
        active: input.active !== undefined ? !!input.active : !!current.active,
        description_pt:
          input.description?.pt !== undefined
            ? input.description.pt
            : current.description.pt,
        description_en:
          input.description?.en !== undefined
            ? input.description.en
            : current.description.en,
        location: input.location !== undefined ? input.location : current.location,
        sort_order:
          input.sortOrder !== undefined ? +input.sortOrder : current.sortOrder,
        pricing:
          input.pricing !== undefined ? input.pricing : current.pricing ?? null,
      })
      .eq("id", id),
  );

  return getExperience(id);
}

export async function deleteExperience(id) {
  const { data } = await must(
    supabase.from("experiences").delete().eq("id", id).select("id"),
  );
  return (data ?? []).length > 0;
}

export async function createBooking(payload) {
  const { data } = await must(
    supabase
      .from("bookings")
      .insert({ period: null, ...payload })
      .select("*")
      .single(),
  );
  return data;
}

export async function listBookings() {
  const { data } = await must(
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
  );
  return data ?? [];
}

export async function updateBookingStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");
  const { data } = await must(
    supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle(),
  );
  return data ?? null;
}

export async function deleteBooking(id) {
  const { data } = await must(
    supabase.from("bookings").delete().eq("id", id).select("id"),
  );
  return (data ?? []).length > 0;
}

function bookingLoad(b) {
  return b.kind === "rental" ? b.quantity : b.count;
}

async function isBlackout(experienceId, date) {
  const { data } = await must(
    supabase
      .from("blackouts")
      .select("id")
      .eq("experience_id", experienceId)
      .eq("date", date)
      .maybeSingle(),
  );
  return !!data;
}

async function bookedOnDate(experienceId, date) {
  const { data } = await must(
    supabase
      .from("bookings")
      .select("kind,count,quantity")
      .eq("experience_id", experienceId)
      .eq("date", date)
      .neq("status", "cancelled"),
  );
  return (data ?? []).reduce((sum, b) => sum + bookingLoad(b), 0);
}

export async function availabilityFor(experienceId, date) {
  const { data: exp } = await must(
    supabase
      .from("experiences")
      .select("capacity,active")
      .eq("id", experienceId)
      .maybeSingle(),
  );
  if (!exp) return null;
  const booked = await bookedOnDate(experienceId, date);
  const blocked = !exp.active || (await isBlackout(experienceId, date));
  return {
    capacity: exp.capacity,
    booked,
    remaining: blocked ? 0 : Math.max(0, exp.capacity - booked),
    blocked,
  };
}

export async function availabilityRange(experienceId, from, to) {
  const { data: exp } = await must(
    supabase
      .from("experiences")
      .select("capacity,active")
      .eq("id", experienceId)
      .maybeSingle(),
  );
  if (!exp) return null;

  const { data: blackoutRows } = await must(
    supabase
      .from("blackouts")
      .select("date")
      .eq("experience_id", experienceId)
      .gte("date", from)
      .lte("date", to),
  );
  const blocked = new Set((blackoutRows ?? []).map((r) => r.date));

  const { data: bookedRows } = await must(
    supabase
      .from("bookings")
      .select("date,kind,count,quantity")
      .eq("experience_id", experienceId)
      .gte("date", from)
      .lte("date", to)
      .neq("status", "cancelled"),
  );

  const bookedByDate = {};
  for (const b of bookedRows ?? []) {
    bookedByDate[b.date] = (bookedByDate[b.date] ?? 0) + bookingLoad(b);
  }

  const days = [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
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

export async function listBlackouts(experienceId) {
  let query = supabase.from("blackouts").select("*").order("date", { ascending: true });
  if (experienceId) query = query.eq("experience_id", experienceId);
  const { data } = await must(query);
  return data ?? [];
}

export async function addBlackout(experienceId, date, reason) {
  await must(
    supabase.from("blackouts").upsert(
      { experience_id: experienceId, date, reason: reason ?? null },
      { onConflict: "experience_id,date" },
    ),
  );
  const { data } = await must(
    supabase
      .from("blackouts")
      .select("*")
      .eq("experience_id", experienceId)
      .eq("date", date)
      .single(),
  );
  return data;
}

export async function removeBlackout(experienceId, date) {
  const { data } = await must(
    supabase
      .from("blackouts")
      .delete()
      .eq("experience_id", experienceId)
      .eq("date", date)
      .select("id"),
  );
  return (data ?? []).length > 0;
}

export async function getStats() {
  const { data: bookings } = await must(supabase.from("bookings").select("status,total"));
  const all = bookings ?? [];

  const revenue = all.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const revenueConfirmed = all
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.total || 0), 0);

  const byStatus = { pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
  all.forEach((b) => {
    if (b.status in byStatus) byStatus[b.status] += 1;
  });

  const { count: experiences } = await must(
    supabase
      .from("experiences")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
  );

  return {
    bookings: all.length,
    revenue,
    revenueConfirmed,
    experiences: experiences ?? 0,
    byStatus,
  };
}

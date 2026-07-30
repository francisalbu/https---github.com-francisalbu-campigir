import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import {
  getExperiences,
  getAllExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  createBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
  availabilityFor,
  availabilityRange,
  listBlackouts,
  addBlackout,
  removeBlackout,
  getStats,
} from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");

const app = express();
const PORT = process.env.PORT || 3002;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "campigir-admin";

app.use(cors());
app.use(express.json());

/** Bearer-token auth guard for admin routes. */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/** Health check. */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/** All experiences & rentals (source of truth for the frontend). */
app.get("/api/experiences", (_req, res) => {
  try {
    res.json({ experiences: getExperiences() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load experiences" });
  }
});

/**
 * Public availability for an experience over a date range.
 * GET /api/experiences/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Defaults to the next 60 days when the range is omitted.
 */
app.get("/api/experiences/:id/availability", (req, res) => {
  const today = new Date();
  const from = String(req.query.from || today.toISOString().slice(0, 10));
  const defaultTo = new Date(today);
  defaultTo.setDate(defaultTo.getDate() + 60);
  const to = String(req.query.to || defaultTo.toISOString().slice(0, 10));
  const days = availabilityRange(req.params.id, from, to);
  if (days === null) return res.status(404).json({ error: "Experience not found" });
  res.json({ availability: days });
});

/**
 * Create a booking. Prices are recomputed server-side from the stored
 * experience so the client cannot tamper with the total.
 */
app.post("/api/bookings", (req, res) => {
  const b = req.body ?? {};

  // Basic validation.
  const required = ["experienceId", "date", "name", "email"];
  const missing = required.filter((k) => !b[k]);
  if (missing.length) {
    return res.status(400).json({ error: "Missing fields", fields: missing });
  }

  const experience = getExperience(b.experienceId);
  if (!experience) {
    return res.status(404).json({ error: "Experience not found" });
  }

  const isRental = experience.type === "rental";
  const count = Math.max(1, parseInt(b.count, 10) || 1);
  const quantity = isRental ? Math.max(1, parseInt(b.quantity, 10) || 1) : 1;

  // Tiered rental pricing: when the experience has a price table and the client
  // picked a valid period, the total is that tier's price × quantity.
  const VALID_PERIODS = ["h2", "daily", "d1", "d3", "d5", "week"];
  const period =
    isRental &&
    experience.pricing &&
    typeof b.period === "string" &&
    VALID_PERIODS.includes(b.period) &&
    experience.pricing[b.period] != null
      ? b.period
      : null;

  let total;
  if (period) {
    const tierPrice = Number(experience.pricing[period]);
    total = tierPrice * quantity;
  } else {
    const unitPrice = Number(
      isRental ? experience.pricePerHour ?? experience.price : experience.price,
    );
    total = isRental ? unitPrice * count * quantity : unitPrice * count;
  }

  // Availability guard: reject blocked days and overbooking. A rental consumes
  // `quantity` units, an experience consumes `count` seats.
  const load = isRental ? quantity : count;
  const availability = availabilityFor(experience.id, String(b.date));
  if (availability?.blocked) {
    return res
      .status(409)
      .json({ error: "Data indisponível para esta atividade." });
  }
  if (availability && load > availability.remaining) {
    return res.status(409).json({
      error: "Sem disponibilidade suficiente nesta data.",
      remaining: availability.remaining,
    });
  }

  try {
    const booking = createBooking({
      experience_id: experience.id,
      kind: experience.type,
      date: String(b.date),
      time: b.time ? String(b.time) : null,
      count,
      quantity,
      total,
      name: String(b.name),
      email: String(b.email),
      phone: b.phone ? String(b.phone) : null,
      notes: b.notes ? String(b.notes) : null,
      period,
    });
    res.status(201).json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/** Admin: list all bookings (protected by a simple bearer token). */
app.get("/api/bookings", requireAdmin, (_req, res) => {
  res.json({ bookings: listBookings() });
});

/** Admin login: exchange the password for the bearer token. */
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (password !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Invalid password" });
  }
  res.json({ token: ADMIN_TOKEN });
});

/** Admin dashboard statistics. */
app.get("/api/admin/stats", requireAdmin, (_req, res) => {
  res.json({ stats: getStats() });
});

/** Update a booking's status. */
app.patch("/api/bookings/:id", requireAdmin, (req, res) => {
  const { status } = req.body ?? {};
  try {
    const booking = updateBookingStatus(Number(req.params.id), status);
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json({ booking });
  } catch {
    res.status(400).json({ error: "Invalid status" });
  }
});

/** Delete a booking. */
app.delete("/api/bookings/:id", requireAdmin, (req, res) => {
  const removed = deleteBooking(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Admin: experiences & rentals CRUD                                  */
/* ------------------------------------------------------------------ */

/** List every experience (including inactive ones) for the backoffice. */
app.get("/api/admin/experiences", requireAdmin, (_req, res) => {
  res.json({ experiences: getAllExperiences() });
});

/** Create a new experience or rental. */
app.post("/api/admin/experiences", requireAdmin, (req, res) => {
  const b = req.body ?? {};
  if (!b.title?.pt && !b.title?.en) {
    return res.status(400).json({ error: "Título obrigatório" });
  }
  try {
    const experience = createExperience(b);
    res.status(201).json({ experience });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

/** Update an experience or rental. */
app.patch("/api/admin/experiences/:id", requireAdmin, (req, res) => {
  const experience = updateExperience(req.params.id, req.body ?? {});
  if (!experience) return res.status(404).json({ error: "Not found" });
  res.json({ experience });
});

/** Delete an experience or rental. */
app.delete("/api/admin/experiences/:id", requireAdmin, (req, res) => {
  const removed = deleteExperience(req.params.id);
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Admin: calendar / blackouts                                        */
/* ------------------------------------------------------------------ */

/** Availability for an experience across a date range (admin calendar). */
app.get(
  "/api/admin/experiences/:id/availability",
  requireAdmin,
  (req, res) => {
    const today = new Date();
    const from = String(req.query.from || today.toISOString().slice(0, 10));
    const defaultTo = new Date(today);
    defaultTo.setDate(defaultTo.getDate() + 60);
    const to = String(req.query.to || defaultTo.toISOString().slice(0, 10));
    const days = availabilityRange(req.params.id, from, to);
    if (days === null) return res.status(404).json({ error: "Not found" });
    res.json({ availability: days });
  },
);

/** List blackout days (optionally filtered by experience). */
app.get("/api/admin/blackouts", requireAdmin, (req, res) => {
  res.json({ blackouts: listBlackouts(req.query.experienceId) });
});

/** Block a date for an experience. */
app.post("/api/admin/blackouts", requireAdmin, (req, res) => {
  const { experienceId, date, reason } = req.body ?? {};
  if (!experienceId || !date) {
    return res.status(400).json({ error: "experienceId and date required" });
  }
  if (!getExperience(experienceId)) {
    return res.status(404).json({ error: "Experience not found" });
  }
  res.status(201).json({ blackout: addBlackout(experienceId, date, reason) });
});

/** Unblock a date for an experience. */
app.delete("/api/admin/blackouts", requireAdmin, (req, res) => {
  const experienceId = req.query.experienceId || req.body?.experienceId;
  const date = req.query.date || req.body?.date;
  if (!experienceId || !date) {
    return res.status(400).json({ error: "experienceId and date required" });
  }
  const removed = removeBlackout(String(experienceId), String(date));
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// Serve the built frontend (production). SPA fallback sends index.html for
// any non-API route so client-side routing (e.g. /admin) works on refresh.
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Campigir API running on http://localhost:${PORT}`);
});
import type { Lang } from "@/i18n/i18n";

export type ExperienceType = "experience" | "rental";

export type Localized = { pt: string; en: string };

/** Tiered rental pricing (euros). Keys map to fixed rental periods. */
export type PeriodKey = "h2" | "daily" | "d1" | "d3" | "d5" | "week";
export type PriceTiers = Partial<Record<PeriodKey, number | string>>;

/** Ordered period metadata with localized labels. */
export const PERIODS: Array<{ key: PeriodKey; label: Localized }> = [
  { key: "h2", label: { pt: "2 Horas", en: "2 Hours" } },
  { key: "daily", label: { pt: "8 Horas (10h-18h)", en: "8 Hours (10am-6pm)" } },
  { key: "d1", label: { pt: "24 Horas", en: "24 Hours" } },
  { key: "d3", label: { pt: "3 Dias", en: "3 Days" } },
  { key: "d5", label: { pt: "5 Dias", en: "5 Days" } },
  { key: "week", label: { pt: "7 Dias", en: "7 Days" } },
];

/** Periods whose check-in time is fixed (open 10h–18h). */
export const FIXED_TIME_PERIODS: PeriodKey[] = ["daily"];

/** Rental opening hours (check-in slots), 10h–18h. */
export const OPENING_HOUR = 10;
export const CLOSING_HOUR = 18;

/** Available check-in slots for a period, respecting opening hours. */
export function checkInSlots(period: PeriodKey): string[] {
  // A 2-hour rental must end by closing time, so the latest start is 16h.
  const latest = period === "h2" ? CLOSING_HOUR - 2 : CLOSING_HOUR - 1;
  const slots: string[] = [];
  for (let h = OPENING_HOUR; h <= latest; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export type Experience = {
  id: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  type: ExperienceType;
  title: Localized;
  /** Numeric duration (hours) for experiences. */
  duration: string;
  /** Starting price in euros. */
  price: string;
  /** Hourly price in euros (rentals only). */
  pricePerHour?: string;
  /** Whether the base price is per day (rentals) rather than per experience. */
  perDay?: boolean;
  /** Tiered pricing per period (rentals with a price table). */
  pricing?: PriceTiers | null;
};

type Database = {
  experiences: Experience[];
};

/**
 * Data-access layer.
 *
 * Primary source is the backend API (GET /api/experiences). If the API is
 * unreachable (e.g. static-only preview), we fall back to the bundled
 * db.json so the app still renders. Bookings go through createBooking().
 */
const API_URL = "/api/experiences";
const FALLBACK_URL = "./db.json";

let cache: Experience[] | null = null;

/** Fetch all experiences & rentals from the API, falling back to db.json. */
export async function fetchExperiences(): Promise<Experience[]> {
  if (cache) return cache;
  try {
    const res = await fetch(API_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as Database;
    cache = data.experiences ?? [];
    return cache;
  } catch {
    const res = await fetch(FALLBACK_URL, { cache: "no-cache" });
    if (!res.ok) {
      throw new Error(`Failed to load database (${res.status})`);
    }
    const data = (await res.json()) as Database;
    cache = data.experiences ?? [];
    return cache;
  }
}

export type BookingInput = {
  experienceId: string;
  date: string;
  time?: string;
  count: number;
  quantity?: number;
  period?: PeriodKey;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type Booking = {
  id: number;
  experience_id: string;
  kind: string;
  date: string;
  time: string | null;
  count: number;
  quantity: number;
  total: number;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  period?: string | null;
};

/** Submit a booking to the backend. Returns the persisted booking. */
export async function createBooking(input: BookingInput): Promise<Booking> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error ?? `Booking failed (${res.status})`);
  }
  const data = (await res.json()) as { booking: Booking };
  return data.booking;
}

/** Localized label for an experience type, used as the card category badge. */
export function typeLabel(type: ExperienceType, lang: Lang): string {
  const labels: Record<ExperienceType, Localized> = {
    experience: { pt: "Experiência", en: "Experience" },
    rental: { pt: "Aluguer", en: "Rental" },
  };
  return labels[type][lang];
}

/** Lowest advertised price (euros) for an experience, for “from X €” labels. */
export function lowestPrice(e: Experience): number {
  // For tiered rentals we always advertise the 2-hour ("h2") price, never a
  // per-hour rate, so "desde X €" reflects the real minimum bookable period.
  if (e.pricing) {
    const h2 = Number(e.pricing.h2);
    if (Number.isFinite(h2) && h2 > 0) return h2;
    const tiers = Object.values(e.pricing)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (tiers.length) return Math.min(...tiers);
  }
  const base = Number(e.price);
  return Number.isFinite(base) && base > 0 ? base : 0;
}

/**
 * Admin API client for the Campigir backoffice.
 *
 * The bearer token is stored in localStorage after login so the session
 * survives page reloads. All admin requests attach it automatically.
 */

const TOKEN_KEY = "campigir-admin-token";
const API_BASE = (
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).
    env?.VITE_API_URL ?? ""
).replace(/\/+$/, "");

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

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
  status: BookingStatus;
  created_at: string;
  period?: string | null;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Stats = {
  bookings: number;
  revenue: number;
  revenueConfirmed: number;
  experiences: number;
  byStatus: Record<BookingStatus, number>;
};

export type ExperienceType = "experience" | "rental";

/** Tiered rental pricing (all values in euros). */
export type PriceTiers = {
  h2?: number | string;
  daily?: number | string;
  d1?: number | string;
  d3?: number | string;
  d5?: number | string;
  week?: number | string;
};

export type AdminExperience = {
  id: string;
  href: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  type: ExperienceType;
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  location: string;
  duration: string | null;
  price: string | null;
  pricePerHour?: string;
  perDay?: boolean;
  capacity: number;
  active: boolean;
  sortOrder: number;
  pricing?: PriceTiers | null;
};

export type ExperienceInput = {
  id?: string;
  href?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  type: ExperienceType;
  title: { pt: string; en: string };
  description?: { pt: string; en: string };
  location?: string;
  duration?: string | null;
  price?: string | null;
  pricePerHour?: string | null;
  perDay?: boolean;
  capacity?: number;
  active?: boolean;
  pricing?: PriceTiers | null;
};

export type DayAvailability = {
  date: string;
  capacity: number;
  booked: number;
  remaining: number;
  blocked: boolean;
};

export type Blackout = {
  id: number;
  experience_id: string;
  date: string;
  reason: string | null;
  created_at: string;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Exchange the password for a token. Throws on invalid credentials. */
export async function login(password: string): Promise<string> {
  const res = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid password");
    throw new Error("Admin API unavailable");
  }
  const data = (await res.json()) as { token: string };
  setToken(data.token);
  return data.token;
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(apiUrl("/api/admin/stats"), { headers: authHeaders() });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to load stats");
  const data = (await res.json()) as { stats: Stats };
  return data.stats;
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch(apiUrl("/api/bookings"), { headers: authHeaders() });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to load bookings");
  const data = (await res.json()) as { bookings: Booking[] };
  return data.bookings;
}

export async function updateStatus(
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  const res = await fetch(apiUrl(`/api/bookings/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to update booking");
  const data = (await res.json()) as { booking: Booking };
  return data.booking;
}

export async function deleteBooking(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/bookings/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("Failed to delete booking");
}

/* ---------------------------------------------------------------- */
/* Experiences & rentals management                                 */
/* ---------------------------------------------------------------- */

async function parseJson<T>(res: Response, errorMsg: string): Promise<T> {
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error ?? errorMsg);
  }
  return (await res.json()) as T;
}

export async function fetchAdminExperiences(): Promise<AdminExperience[]> {
  const res = await fetch(apiUrl("/api/admin/experiences"), { headers: authHeaders() });
  const data = await parseJson<{ experiences: AdminExperience[] }>(
    res,
    "Failed to load experiences",
  );
  return data.experiences;
}

export async function createExperience(
  input: ExperienceInput,
): Promise<AdminExperience> {
  const res = await fetch(apiUrl("/api/admin/experiences"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ experience: AdminExperience }>(
    res,
    "Failed to create experience",
  );
  return data.experience;
}

export async function updateExperience(
  id: string,
  input: Partial<ExperienceInput>,
): Promise<AdminExperience> {
  const res = await fetch(apiUrl(`/api/admin/experiences/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ experience: AdminExperience }>(
    res,
    "Failed to update experience",
  );
  return data.experience;
}

export async function deleteExperience(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/experiences/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseJson(res, "Failed to delete experience");
}

/* ---------------------------------------------------------------- */
/* Calendar / availability                                          */
/* ---------------------------------------------------------------- */

export async function fetchAvailability(
  experienceId: string,
  from: string,
  to: string,
): Promise<DayAvailability[]> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(
    apiUrl(`/api/admin/experiences/${experienceId}/availability?${params}`),
    { headers: authHeaders() },
  );
  const data = await parseJson<{ availability: DayAvailability[] }>(
    res,
    "Failed to load availability",
  );
  return data.availability;
}

export async function addBlackout(
  experienceId: string,
  date: string,
  reason?: string,
): Promise<Blackout> {
  const res = await fetch(apiUrl("/api/admin/blackouts"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ experienceId, date, reason }),
  });
  const data = await parseJson<{ blackout: Blackout }>(
    res,
    "Failed to block date",
  );
  return data.blackout;
}

export async function removeBlackout(
  experienceId: string,
  date: string,
): Promise<void> {
  const params = new URLSearchParams({ experienceId, date });
  const res = await fetch(apiUrl(`/api/admin/blackouts?${params}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseJson(res, "Failed to unblock date");
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

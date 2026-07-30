import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  createBooking,
  checkInSlots,
  FIXED_TIME_PERIODS,
  PERIODS,
  typeLabel,
  type Booking,
  type Experience,
  type PeriodKey,
} from "@/data/experiences";
import { useI18n } from "@/i18n/i18n";

export type BookingModalProps = {
  experience: Experience | null;
  onClose: () => void;
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

/** A number stepper with - / + controls. */
function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/25 px-4 py-3">
      <span className="font-ppneuemontreal text-white/90 text-[15px] md:text-[16px]">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          aria-label="-"
          className="w-9 h-9 rounded-full bg-white/10 text-white text-[22px] leading-none flex items-center justify-center disabled:opacity-30 active:scale-95 transition"
        >
          −
        </button>
        <span className="min-w-[28px] text-center font-mangogrotesque text-white text-[26px] tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          aria-label="+"
          className="w-9 h-9 rounded-full bg-white/10 text-white text-[22px] leading-none flex items-center justify-center disabled:opacity-30 active:scale-95 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

export const BookingModal = ({ experience, onClose }: BookingModalProps) => {
  const { t, lang } = useI18n();
  const isRental = experience?.type === "rental";

  // Available pricing tiers for this rental (in canonical order).
  const tiers = useMemo(() => {
    if (!experience?.pricing) return [];
    return PERIODS.filter((p) => {
      const v = Number(experience.pricing?.[p.key]);
      return Number.isFinite(v) && v > 0;
    }).map((p) => ({
      key: p.key,
      label: p.label[lang],
      price: Number(experience.pricing?.[p.key]),
    }));
  }, [experience, lang]);
  const hasTiers = isRental && tiers.length > 0;

  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [count, setCount] = useState(1); // people (experience) or hours (rental)
  const [quantity, setQuantity] = useState(1); // units (rental only)
  const [period, setPeriod] = useState<PeriodKey | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  // Reset the form whenever a new experience is opened.
  useEffect(() => {
    if (!experience) return;
    setDate("");
    setTime(TIME_SLOTS[0]);
    setCount(1);
    setQuantity(1);
    setPeriod(tiers.length ? tiers[0].key : "");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setError(false);
    setSubmitting(false);
    setDone(false);
    setConfirmed(null);
  }, [experience]);

  // Lock body scroll and close on Escape while the modal is open.
  useEffect(() => {
    if (!experience) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [experience, onClose]);

  const unitPrice = useMemo(() => {
    if (!experience) return 0;
    if (hasTiers) {
      const tier = tiers.find((x) => x.key === period);
      return tier ? tier.price : tiers[0].price;
    }
    if (isRental) return Number(experience.pricePerHour ?? experience.price);
    return Number(experience.price);
  }, [experience, isRental, hasTiers, tiers, period]);

  const total = useMemo(() => {
    if (hasTiers) return unitPrice * quantity;
    if (isRental) return unitPrice * count * quantity;
    return unitPrice * count;
  }, [hasTiers, isRental, unitPrice, count, quantity]);

  // Check-in time for tiered rentals (fixed 10h-18h for the daily period).
  const needsCheckIn =
    hasTiers && !!period && !FIXED_TIME_PERIODS.includes(period as PeriodKey);
  const checkInOptions = useMemo(
    () => (needsCheckIn ? checkInSlots(period as PeriodKey) : []),
    [needsCheckIn, period],
  );

  // Keep the selected time valid for the current period's slots.
  useEffect(() => {
    if (needsCheckIn && !checkInOptions.includes(time)) {
      setTime(checkInOptions[0] ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCheckIn, period]);

  if (!experience) return null;

  const title = experience.title[lang];
  const category = typeLabel(experience.type, lang);

  const countPlural = count === 1;
  const countLabel = isRental
    ? countPlural
      ? t("booking.hour")
      : t("booking.hours_plural")
    : countPlural
      ? t("booking.person")
      : t("booking.people_plural");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !email) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    try {
      const booking = await createBooking({
        experienceId: experience.id,
        date,
        time: needsCheckIn
          ? time
          : hasTiers
            ? "10:00"
            : isRental
              ? undefined
              : time,
        count,
        quantity: isRental ? quantity : undefined,
        period: hasTiers && period ? period : undefined,
        name,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
      });
      setConfirmed(booking);
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Voucher / summary helpers (available once a booking is confirmed) ---
  // Always derive a booking reference. Use the DB id when available, otherwise
  // fall back to a time-based code so every booking still gets an id.
  const bookingId =
    confirmed?.id ??
    (confirmed ? Number(String(Date.now()).slice(-6)) : null);
  const refCode =
    bookingId != null ? `CG-${String(bookingId).padStart(5, "0")}` : "";
  const periodKey =
    (confirmed?.period as PeriodKey | null | undefined) ??
    (period || undefined);
  const periodLabel = periodKey
    ? (PERIODS.find((p) => p.key === periodKey)?.label[lang] ?? "")
    : "";
  const whenTime =
    confirmed?.time ?? (needsCheckIn ? time : hasTiers ? "10:00" : time);

  const buildSummaryRows = (): Array<[string, string]> => {
    if (!confirmed) return [];
    const rows: Array<[string, string]> = [];
    rows.push([t("booking.ref"), refCode]);
    rows.push([isRental ? t("booking.item") : t("booking.activity"), title]);
    rows.push([t("booking.when"), confirmed.date || date]);

    if (hasTiers && periodLabel) rows.push([t("booking.period"), periodLabel]);

    if (isRental && !hasTiers) {
      rows.push([
        t("booking.hours"),
        `${count} ${count === 1 ? t("booking.hour") : t("booking.hours_plural")}`,
      ]);
    }

    if (whenTime) {
      rows.push([hasTiers ? t("booking.checkIn") : t("booking.time"), whenTime]);
    }

    if (isRental) {
      rows.push([
        t("booking.quantity"),
        `${quantity} ${quantity === 1 ? t("booking.unit") : t("booking.unit_plural")}`,
      ]);
    } else {
      rows.push([
        t("booking.people"),
        `${count} ${count === 1 ? t("booking.person") : t("booking.people_plural")}`,
      ]);
    }

    rows.push([t("booking.name"), name]);
    rows.push([t("booking.email"), email]);
    if (phone) rows.push([t("booking.phone"), phone]);
    rows.push([t("booking.total"), `${confirmed.total} €`]);
    return rows;
  };
  const summaryRows = buildSummaryRows();

  const downloadVoucher = () => {
    if (!confirmed) return;
    const rowsHtml = summaryRows
      .map(
        ([k, v]) =>
          `<tr><td class="k">${k}</td><td class="v">${String(v)}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>Campigir-${refCode}</title>
<style>
  @page{size:A4;margin:16mm}
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;background:#fff;color:#18181b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{max-width:640px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:20px;overflow:hidden}
  .hdr{background:#1B5E20;color:#fff;padding:28px 32px}
  .hdr h1{margin:0;font-size:34px;letter-spacing:.5px}
  .hdr p{margin:6px 0 0;opacity:.85;font-size:14px;text-transform:uppercase;letter-spacing:2px}
  .ref{display:inline-block;margin-top:16px;background:rgba(255,255,255,.15);padding:8px 16px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:1px}
  .body{padding:28px 32px}
  table{width:100%;border-collapse:collapse}
  td{padding:12px 0;border-bottom:1px solid #eee;font-size:15px;vertical-align:top}
  td.k{color:#6b7280;width:42%;text-transform:uppercase;font-size:12px;letter-spacing:1px;padding-top:15px}
  td.v{font-weight:600;text-align:right}
  tr:last-child td{border-bottom:none;font-size:20px;padding-top:18px}
  tr:last-child td.k{padding-top:22px}
  .note{margin:0;padding:20px 32px;background:#E4F2D2;color:#1B5E20;font-size:14px}
  .foot{padding:20px 32px 32px;text-align:center;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="sheet">
    <div class="hdr">
      <h1>Campigir</h1>
      <p>${t("booking.summaryTitle")}</p>
      <div class="ref">${refCode}</div>
    </div>
    <div class="body"><table>${rowsHtml}</table></div>
    <p class="note">${t("booking.docNote")}</p>
    <div class="foot">Campigir · ${new Date().toLocaleString(
      lang === "pt" ? "pt-PT" : "en-GB",
    )}</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    };
    window.onafterprint = function () { window.close(); };
  </script>
</body></html>`;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t("booking.title")}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("booking.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet / card */}
      <div className="relative z-[1] w-full md:w-[520px] max-h-[92vh] overflow-y-auto bg-rose-900 text-white rounded-t-[28px] md:rounded-[28px] shadow-2xl animate-[slideUp_.25s_ease-out] md:m-4">
        {/* Grab handle (mobile) */}
        <div className="md:hidden pt-3 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-[2] bg-rose-900/95 backdrop-blur px-5 md:px-7 pt-4 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-mangogrotesque uppercase tracking-wide text-teal-600 text-[18px]">
                {category}
              </span>
              <h2 className="font-roslindaledisplaycondensed text-[28px] md:text-[34px] leading-[1.05] mt-1">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("booking.close")}
              className="relative z-[5] shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[20px] transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {done ? (
          <div className="px-5 md:px-7 py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-[32px] mb-5">
              ✓
            </div>
            <h3 className="font-roslindaledisplaycondensed text-[26px] mb-2 text-center">
              {t("booking.successTitle")}
            </h3>
            {t("booking.successText") && (
              <p className="font-ppneuemontreal text-white/80 text-[15px] mb-6 text-center">
                {t("booking.successText")}
              </p>
            )}
            <div className="rounded-[18px] border border-white/20 bg-white/5 p-4 mb-4">
              <h4 className="font-mangogrotesque uppercase tracking-wide text-[20px] text-white mb-3">
                {t("booking.summaryTitle")}
              </h4>
              <div className="space-y-2">
                {summaryRows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="font-ppneuemontreal text-[12px] uppercase tracking-wide text-white/65">
                      {label}
                    </span>
                    <span className="font-ppneuemontreal text-[14px] text-right text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="font-ppneuemontreal text-white/75 text-[13px] mb-4 text-center">
              {t("booking.docNote")}
            </p>
            <button
              type="button"
              onClick={downloadVoucher}
              className="w-full rounded-full border border-white/30 text-white font-mangogrotesque uppercase text-[20px] tracking-wide py-3.5 active:scale-[0.99] transition hover:bg-white/10 mb-3"
            >
              {t("booking.downloadDoc")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-white text-rose-900 font-mangogrotesque uppercase text-[20px] tracking-wide py-3.5 active:scale-[0.99] transition"
            >
              {t("booking.done")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 md:px-7 py-5 space-y-4">
            {/* Date */}
            <label className="block">
              <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                {t("booking.date")} *
              </span>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white font-ppneuemontreal text-[16px] outline-none focus:border-teal-600 [color-scheme:dark]"
              />
            </label>

            {/* Time (experiences only) */}
            {!isRental && (
              <label className="block">
                <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                  {t("booking.time")}
                </span>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white font-ppneuemontreal text-[16px] outline-none focus:border-teal-600 [color-scheme:dark]"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} className="text-black">
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Period selector (tiered rentals) or count stepper */}
            {hasTiers ? (
              <div>
                <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                  {t("booking.period")}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {tiers.map((tier) => {
                    const selected = period === tier.key;
                    return (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => setPeriod(tier.key)}
                        className={`flex items-center justify-between gap-2 rounded-[16px] border px-3.5 py-3 text-left transition ${
                          selected
                            ? "border-white bg-white text-rose-900"
                            : "border-white/25 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="font-ppneuemontreal text-[14px] leading-tight">
                          {tier.label}
                        </span>
                        <span className="font-mangogrotesque text-[20px] leading-none whitespace-nowrap">
                          {tier.price} €
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Check-in time (all periods except the fixed 10h-18h one) */}
                {needsCheckIn ? (
                  <label className="block mt-4">
                    <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                      {t("booking.checkIn")}
                    </span>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white font-ppneuemontreal text-[16px] outline-none focus:border-teal-600 [color-scheme:dark]"
                    >
                      {checkInOptions.map((slot) => (
                        <option key={slot} value={slot} className="text-black">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mt-3 font-ppneuemontreal text-white/60 text-[13px]">
                    {t("booking.dailyHours")}
                  </p>
                )}
              </div>
            ) : (
              <Stepper
                label={isRental ? t("booking.hours") : t("booking.people")}
                value={count}
                min={1}
                max={isRental ? 12 : 20}
                onChange={setCount}
              />
            )}

            {/* Quantity stepper (rentals only) */}
            {isRental && (
              <Stepper
                label={t("booking.quantity")}
                value={quantity}
                min={1}
                max={20}
                onChange={setQuantity}
              />
            )}

            {/* Contact details */}
            <label className="block">
              <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                {t("booking.name")} *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("booking.namePlaceholder")}
                className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white placeholder-white/40 font-ppneuemontreal text-[16px] outline-none focus:border-teal-600"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                  {t("booking.email")} *
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("booking.emailPlaceholder")}
                  className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white placeholder-white/40 font-ppneuemontreal text-[16px] outline-none focus:border-teal-600"
                />
              </label>
              <label className="block">
                <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                  {t("booking.phone")}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("booking.phonePlaceholder")}
                  className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white placeholder-white/40 font-ppneuemontreal text-[16px] outline-none focus:border-teal-600"
                />
              </label>
            </div>

            <label className="block">
              <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
                {t("booking.notes")}
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("booking.notesPlaceholder")}
                rows={2}
                className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white placeholder-white/40 font-ppneuemontreal text-[16px] outline-none focus:border-teal-600 resize-none"
              />
            </label>

            {error && (
              <p className="text-red-300 font-ppneuemontreal text-[14px]">
                {t("booking.required")}
              </p>
            )}

            {/* Price summary + submit */}
            <div className="sticky bottom-0 -mx-5 md:-mx-7 mt-2 bg-rose-900/95 backdrop-blur px-5 md:px-7 pt-4 pb-5 border-t border-white/10">
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-ppneuemontreal text-white/70 text-[14px]">
                  {hasTiers
                    ? `${unitPrice} € · ${
                        tiers.find((x) => x.key === period)?.label ?? ""
                      }${quantity > 1 ? ` × ${quantity}` : ""}`
                    : isRental
                      ? `${experience.pricePerHour ?? experience.price} € ${t("booking.perHour")} · ${count} ${countLabel}${quantity > 1 ? ` × ${quantity}` : ""}`
                      : `${experience.price} € ${t("booking.perPerson")} · ${count} ${countLabel}`}
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mangogrotesque uppercase text-white/80 text-[22px]">
                  {t("booking.total")}
                </span>
                <span className="font-roslindaledisplaycondensed text-[34px] leading-none">
                  {total} €
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-white text-rose-900 font-mangogrotesque uppercase text-[22px] tracking-wide py-3.5 active:scale-[0.99] transition disabled:opacity-60"
              >
                {submitting ? "…" : t("booking.confirm")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  deleteBooking,
  fetchBookings,
  updateStatus,
  UnauthorizedError,
  type Booking,
  type BookingStatus,
} from "@/admin/api";

export const STATUS_META: Record<
  BookingStatus,
  { label: string; dot: string; badge: string }
> = {
  pending: {
    label: "Pendente",
    dot: "bg-amber-400",
    badge: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  },
  confirmed: {
    label: "Confirmada",
    dot: "bg-teal-500",
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  },
  completed: {
    label: "Concluída",
    dot: "bg-sky-400",
    badge: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  },
  cancelled: {
    label: "Cancelada",
    dot: "bg-red-400",
    badge: "bg-red-400/15 text-red-300 border-red-400/30",
  },
};

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "completed", label: "Concluídas" },
  { value: "cancelled", label: "Canceladas" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const PERIOD_LABELS: Record<string, string> = {
  h2: "2 Horas",
  daily: "Diário",
  d1: "1 Dia",
  d3: "3 Dias",
  d5: "5 Dias",
  week: "1 Semana",
};

/** Human-readable booking detail (period/hours/pax). */
function bookingDetail(b: Booking): string {
  if (b.kind === "rental") {
    if (b.period) {
      const label = PERIOD_LABELS[b.period] ?? b.period;
      return `${label}${b.quantity > 1 ? ` × ${b.quantity} un` : ""}`;
    }
    return `${b.count}h × ${b.quantity} un`;
  }
  return `${b.count} pax`;
}

function toCSV(bookings: Booking[]): string {
  const header = [
    "id",
    "estado",
    "atividade",
    "tipo",
    "data",
    "hora",
    "qtd/horas",
    "unidades",
    "total",
    "nome",
    "email",
    "telemovel",
    "notas",
    "criada_em",
  ];
  const rows = bookings.map((b) =>
    [
      b.id,
      b.status,
      b.experience_id,
      b.kind,
      b.date,
      b.time ?? "",
      b.count,
      b.quantity,
      b.total,
      b.name,
      b.email,
      b.phone ?? "",
      (b.notes ?? "").replace(/\n/g, " "),
      b.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

type Props = {
  onUnauthorized: () => void;
  onDataChange: () => void;
  registerExport: (fn: (() => void) | null) => void;
};

export const BookingsPanel = ({
  onUnauthorized,
  onDataChange,
  registerExport,
}: Props) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    onUnauthorized();
  }, [onUnauthorized]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await fetchBookings());
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? bookings
        : bookings.filter((b) => b.status === filter),
    [bookings, filter],
  );

  const exportCSV = useCallback(() => {
    const blob = new Blob([toCSV(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campigir-reservas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  useEffect(() => {
    registerExport(exportCSV);
    return () => registerExport(null);
  }, [exportCSV, registerExport]);

  const changeStatus = async (id: number, status: BookingStatus) => {
    setBusyId(id);
    try {
      const updated = await updateStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      onDataChange();
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Apagar esta reserva? Esta ação é irreversível.")) {
      return;
    }
    setBusyId(id);
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      onDataChange();
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 font-ppneuemontreal text-[14px] border transition ${
              filter === f.value
                ? "bg-white text-rose-900 border-white"
                : "border-white/20 text-white/80 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/60 font-ppneuemontreal">
          A carregar…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/60 font-ppneuemontreal">
          Sem reservas para este filtro.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-[18px] border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-white/60 font-ppneuemontreal text-[13px] uppercase tracking-wide">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Atividade</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Detalhe</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="font-ppneuemontreal text-[14px]">
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-white/50 text-[13px]">{b.email}</div>
                      {b.phone && (
                        <div className="text-white/50 text-[13px]">
                          {b.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.experience_id}</div>
                      <div className="text-white/50 text-[13px] capitalize">
                        {b.kind === "rental" ? "Aluguer" : "Experiência"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(b.date)}
                      {b.time && (
                        <div className="text-white/50 text-[13px]">
                          {b.time}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {bookingDetail(b)}
                    </td>
                    <td className="px-4 py-3 font-medium">{b.total} €</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        booking={b}
                        busy={busyId === b.id}
                        onStatus={changeStatus}
                        onDelete={remove}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="rounded-[18px] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-ppneuemontreal font-medium">
                      {b.name}
                    </div>
                    <div className="text-white/50 text-[13px] font-ppneuemontreal">
                      {b.email}
                    </div>
                    {b.phone && (
                      <div className="text-white/50 text-[13px] font-ppneuemontreal">
                        {b.phone}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="font-ppneuemontreal text-[14px] text-white/80 mb-1">
                  {b.experience_id} ·{" "}
                  {b.kind === "rental" ? "Aluguer" : "Experiência"}
                </div>
                <div className="font-ppneuemontreal text-[14px] text-white/70 mb-3">
                  {formatDate(b.date)}
                  {b.time ? ` · ${b.time}` : ""} · {bookingDetail(b)} ·{" "}
                  <span className="text-white font-medium">{b.total} €</span>
                </div>
                <RowActions
                  booking={b}
                  busy={busyId === b.id}
                  onStatus={changeStatus}
                  onDelete={remove}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ppneuemontreal text-[12px] ${meta.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function RowActions({
  booking,
  busy,
  onStatus,
  onDelete,
}: {
  booking: Booking;
  busy: boolean;
  onStatus: (id: number, status: BookingStatus) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 md:justify-end flex-wrap">
      <select
        value={booking.status}
        disabled={busy}
        onChange={(e) => onStatus(booking.id, e.target.value as BookingStatus)}
        className="rounded-full border border-white/25 bg-white/5 px-3 py-1.5 font-ppneuemontreal text-[13px] outline-none focus:border-teal-600 [color-scheme:dark] disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="text-black">
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onDelete(booking.id)}
        disabled={busy}
        aria-label="Apagar"
        className="rounded-full border border-red-400/30 text-red-300 hover:bg-red-400/10 px-3 py-1.5 font-ppneuemontreal text-[13px] transition disabled:opacity-50"
      >
        Apagar
      </button>
    </div>
  );
}

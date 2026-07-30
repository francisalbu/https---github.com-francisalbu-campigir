import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addBlackout,
  clearToken,
  fetchAdminExperiences,
  fetchAvailability,
  fetchBookings,
  removeBlackout,
  UnauthorizedError,
  type AdminExperience,
  type Booking,
  type DayAvailability,
} from "@/admin/api";

type Props = {
  onUnauthorized: () => void;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const ALL = "__all__";
const PERIOD_LABELS: Record<string, string> = {
  h2: "2 Horas",
  daily: "Diário",
  d1: "1 Dia",
  d3: "3 Dias",
  d5: "5 Dias",
  week: "1 Semana",
};
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Monday=0 … Sunday=6 offset for a given weekday. */
function mondayOffset(day: number): number {
  return (day + 6) % 7;
}

export const CalendarPanel = ({ onUnauthorized }: Props) => {
  const [experiences, setExperiences] = useState<AdminExperience[]>([]);
  const [selected, setSelected] = useState<string>(ALL);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [days, setDays] = useState<Record<string, DayAvailability>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyDate, setBusyDate] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    onUnauthorized();
  }, [onUnauthorized]);

  // Load experiences and bookings once.
  useEffect(() => {
    (async () => {
      try {
        const [list, bs] = await Promise.all([
          fetchAdminExperiences(),
          fetchBookings(),
        ]);
        setExperiences(list);
        setBookings(bs);
      } catch (err) {
        if (err instanceof UnauthorizedError) handleUnauthorized();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    [cursor],
  );

  const loadAvailability = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      if (selected === ALL) {
        const active = experiences.filter((e) => e.active);
        const results = await Promise.all(
          active.map((e) =>
            fetchAvailability(e.id, iso(monthStart), iso(monthEnd)),
          ),
        );
        const map: Record<string, DayAvailability> = {};
        for (const list of results) {
          for (const d of list) {
            const cur = map[d.date] ?? {
              date: d.date,
              capacity: 0,
              booked: 0,
              remaining: 0,
              blocked: false,
            };
            map[d.date] = {
              date: d.date,
              capacity: cur.capacity + d.capacity,
              booked: cur.booked + d.booked,
              remaining: cur.remaining + d.remaining,
              blocked: false,
            };
          }
        }
        setDays(map);
        return;
      }
      const data = await fetchAvailability(
        selected,
        iso(monthStart),
        iso(monthEnd),
      );
      const map: Record<string, DayAvailability> = {};
      for (const d of data) map[d.date] = d;
      setDays(map);
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [selected, experiences, monthStart, monthEnd, handleUnauthorized]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const toggleBlock = async (date: string, blocked: boolean) => {
    if (selected === ALL) return;
    setBusyDate(date);
    try {
      if (blocked) {
        await removeBlackout(selected, date);
      } else {
        await addBlackout(selected, date);
      }
      await loadAvailability();
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setBusyDate(null);
    }
  };

  // Build the calendar grid (leading blanks + days).
  const cells: Array<{ date: string; day: number } | null> = [];
  const lead = mondayOffset(monthStart.getDay());
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    const date = iso(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    cells.push({ date, day: d });
  }

  const todayIso = iso(new Date());
  const isAll = selected === ALL;
  const selectedExp = experiences.find((e) => e.id === selected);

  // Localized title for an experience id.
  const expName = useCallback(
    (id: string) => experiences.find((e) => e.id === id)?.title.pt ?? id,
    [experiences],
  );

  // Active bookings grouped by day (filtered by the selected activity).
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      if (!isAll && b.experience_id !== selected) continue;
      (map[b.date] ??= []).push(b);
    }
    return map;
  }, [bookings, isAll, selected]);

  const goMonth = (delta: number) =>
    setCursor(
      (c) => new Date(c.getFullYear(), c.getMonth() + delta, 1),
    );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-full border border-white/25 bg-white/5 px-4 py-2 font-ppneuemontreal text-[14px] outline-none focus:border-teal-500 [color-scheme:dark]"
        >
          <option value={ALL} className="text-black">
            Todas as atividades
          </option>
          {experiences.map((e) => (
            <option key={e.id} value={e.id} className="text-black">
              {e.title.pt} · {e.type === "rental" ? "Aluguer" : "Experiência"}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 md:ml-auto">
          <button
            onClick={() => goMonth(-1)}
            className="w-9 h-9 rounded-full border border-white/25 hover:bg-white/10 transition"
          >
            ‹
          </button>
          <span className="font-ppneuemontreal text-[15px] min-w-[150px] text-center">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button
            onClick={() => goMonth(1)}
            className="w-9 h-9 rounded-full border border-white/25 hover:bg-white/10 transition"
          >
            ›
          </button>
        </div>
      </div>

      {isAll ? (
        <p className="font-ppneuemontreal text-white/60 text-[13px] mb-4">
          Vista agregada de todas as atividades ativas · mostra o total de
          reservas e lugares livres por dia. Para bloquear datas, escolha uma
          atividade específica.
        </p>
      ) : (
        selectedExp && (
          <p className="font-ppneuemontreal text-white/60 text-[13px] mb-4">
            Capacidade diária: {selectedExp.capacity}{" "}
            {selectedExp.type === "rental" ? "unidades" : "lugares"} · clique num
            dia para bloquear/desbloquear reservas.
          </p>
        )
      )}

      <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center font-ppneuemontreal text-white/50 text-[12px] uppercase tracking-wide py-1"
            >
              {w}
            </div>
          ))}
        </div>

        <div
          className={`grid grid-cols-7 gap-1 md:gap-2 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {cells.map((cell, i) => {
            if (!cell) return <div key={`b${i}`} />;
            const info = days[cell.date];
            const isPast = cell.date < todayIso;
            const blocked = info?.blocked ?? false;
            const remaining = info?.remaining ?? selectedExp?.capacity ?? 0;
            const booked = info?.booked ?? 0;
            const full = !blocked && remaining <= 0;
            const dayBookings = bookingsByDate[cell.date] ?? [];

            let tone = "border-white/10 bg-white/5 hover:bg-white/10";
            if (blocked) tone = "border-red-400/30 bg-red-400/10 hover:bg-red-400/15";
            else if (full) tone = "border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/15";
            else if (booked > 0)
              tone = "border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/15";

            return (
              <button
                key={cell.date}
                onClick={() => setDetailDate(cell.date)}
                title="Ver detalhe do dia"
                className={`min-h-[92px] md:min-h-[112px] rounded-[12px] border p-1.5 md:p-2 flex flex-col items-start gap-1 text-left transition ${tone} ${
                  isPast ? "opacity-50" : ""
                } ${cell.date === todayIso ? "ring-1 ring-white/60" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-ppneuemontreal text-[13px] md:text-[14px]">
                    {cell.day}
                  </span>
                  {blocked ? (
                    <span className="font-ppneuemontreal text-[9px] md:text-[10px] text-red-300 uppercase tracking-wide">
                      Bloq.
                    </span>
                  ) : (
                    <span
                      className={`font-ppneuemontreal text-[9px] md:text-[10px] ${
                        full ? "text-amber-300" : "text-white/50"
                      }`}
                    >
                      {full ? "esgotado" : `${remaining} livres`}
                    </span>
                  )}
                </div>

                <div className="w-full flex flex-col gap-0.5 overflow-hidden">
                  {dayBookings.slice(0, 3).map((b) => (
                    <span
                      key={b.id}
                      className="block truncate rounded-[6px] bg-teal-500/20 border border-teal-500/30 px-1 py-0.5 font-ppneuemontreal text-[9px] md:text-[10px] text-teal-100"
                      title={`${expName(b.experience_id)} · ${b.name}`}
                    >
                      {expName(b.experience_id)}
                    </span>
                  ))}
                  {dayBookings.length > 3 && (
                    <span className="font-ppneuemontreal text-[9px] md:text-[10px] text-white/50">
                      +{dayBookings.length - 3} mais
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 font-ppneuemontreal text-[12px] text-white/60">
        <Legend cls="bg-teal-500/40" label="Com reservas" />
        <Legend cls="bg-amber-400/40" label="Esgotado" />
        <Legend cls="bg-red-400/40" label="Bloqueado" />
      </div>

      {detailDate && (
        <DayDetail
          date={detailDate}
          bookings={bookingsByDate[detailDate] ?? []}
          expName={expName}
          info={days[detailDate]}
          canBlock={!isAll && !!selectedExp}
          blocked={days[detailDate]?.blocked ?? false}
          busy={busyDate === detailDate}
          onToggleBlock={() =>
            toggleBlock(detailDate, days[detailDate]?.blocked ?? false)
          }
          onClose={() => setDetailDate(null)}
        />
      )}
    </div>
  );
};

function DayDetail({
  date,
  bookings,
  expName,
  info,
  canBlock,
  blocked,
  busy,
  onToggleBlock,
  onClose,
}: {
  date: string;
  bookings: Booking[];
  expName: (id: string) => string;
  info: DayAvailability | undefined;
  canBlock: boolean;
  blocked: boolean;
  busy: boolean;
  onToggleBlock: () => void;
  onClose: () => void;
}) {
  const label = new Date(date + "T00:00:00").toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-rose-900 border border-white/15 rounded-[22px] w-full max-w-[520px] my-8 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-roslindaledisplaycondensed text-[26px] leading-none capitalize">
              {label}
            </h2>
            {info && (
              <p className="font-ppneuemontreal text-white/60 text-[13px] mt-1">
                {info.booked} reservado · {info.remaining} livres
                {blocked ? " · bloqueado" : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        {bookings.length === 0 ? (
          <p className="font-ppneuemontreal text-white/60 text-[14px] py-6 text-center">
            Sem reservas neste dia.
          </p>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-[14px] border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-ppneuemontreal font-medium text-[14px]">
                    {expName(b.experience_id)}
                  </span>
                  <span className="font-ppneuemontreal text-[13px] text-white/70">
                    {b.total} €
                  </span>
                </div>
                <div className="font-ppneuemontreal text-white/60 text-[13px] mt-0.5">
                  {b.name}
                  {b.time ? ` · ${b.time}` : ""} ·{" "}
                  {b.kind === "rental"
                    ? b.period
                      ? `${PERIOD_LABELS[b.period] ?? b.period}${b.quantity > 1 ? ` × ${b.quantity} un` : ""}`
                      : `${b.count}h × ${b.quantity} un`
                    : `${b.count} pax`}
                </div>
              </div>
            ))}
          </div>
        )}

        {canBlock && (
          <button
            onClick={onToggleBlock}
            disabled={busy}
            className={`w-full mt-5 rounded-full px-5 py-2.5 font-ppneuemontreal text-[14px] font-medium transition disabled:opacity-50 ${
              blocked
                ? "bg-white text-rose-900 hover:bg-white/90"
                : "border border-red-400/40 text-red-200 hover:bg-red-400/10"
            }`}
          >
            {busy
              ? "A guardar…"
              : blocked
                ? "Desbloquear este dia"
                : "Bloquear este dia"}
          </button>
        )}
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-3 h-3 rounded-[4px] ${cls}`} />
      {label}
    </span>
  );
}

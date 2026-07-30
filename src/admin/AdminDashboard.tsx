import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearToken,
  fetchStats,
  UnauthorizedError,
  type Stats,
} from "@/admin/api";
import { BookingsPanel } from "@/admin/BookingsPanel";
import { ExperiencesPanel } from "@/admin/ExperiencesPanel";
import { CalendarPanel } from "@/admin/CalendarPanel";

type Tab = "bookings" | "experiences" | "rentals" | "calendar";

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "bookings", label: "Reservas" },
  { value: "experiences", label: "Experiências" },
  { value: "rentals", label: "Alugueres" },
  { value: "calendar", label: "Calendário" },
];

export const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [tab, setTab] = useState<Tab>("bookings");
  const [stats, setStats] = useState<Stats | null>(null);
  const exportRef = useRef<(() => void) | null>(null);
  const [canExport, setCanExport] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    onLogout();
  }, [onLogout]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchStats());
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const registerExport = useCallback((fn: (() => void) | null) => {
    exportRef.current = fn;
    setCanExport(Boolean(fn));
  }, []);

  const logout = () => {
    clearToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-rose-900 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-rose-900/95 backdrop-blur border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://www.campigir.com/site/imagens/logo_1.png"
            alt="Campigir"
            className="h-[40px] w-auto object-contain"
          />
          <span className="hidden md:inline font-ppneuemontreal text-white/50 text-[14px]">
            Backoffice
          </span>
        </div>
        <div className="flex items-center gap-2">
          {tab === "bookings" && canExport && (
            <button
              onClick={() => exportRef.current?.()}
              className="rounded-full border border-white/25 hover:bg-white/10 px-4 py-2 font-ppneuemontreal text-[14px] transition"
            >
              Exportar CSV
            </button>
          )}
          <button
            onClick={logout}
            className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 font-ppneuemontreal text-[14px] transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard label="Reservas" value={stats?.bookings ?? "—"} />
          <StatCard
            label="Receita confirmada"
            value={stats ? `${stats.revenueConfirmed} €` : "—"}
            highlight
          />
          <StatCard label="Pendentes" value={stats?.byStatus.pending ?? "—"} />
          <StatCard
            label="Atividades ativas"
            value={stats?.experiences ?? "—"}
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-4 py-2 font-ppneuemontreal text-[14px] border transition ${
                tab === t.value
                  ? "bg-white text-rose-900 border-white"
                  : "border-white/20 text-white/80 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "bookings" && (
          <BookingsPanel
            onUnauthorized={handleUnauthorized}
            onDataChange={loadStats}
            registerExport={registerExport}
          />
        )}
        {tab === "experiences" && (
          <ExperiencesPanel
            filterType="experience"
            onUnauthorized={handleUnauthorized}
            onDataChange={loadStats}
          />
        )}
        {tab === "rentals" && (
          <ExperiencesPanel
            filterType="rental"
            onUnauthorized={handleUnauthorized}
            onDataChange={loadStats}
          />
        )}
        {tab === "calendar" && (
          <CalendarPanel onUnauthorized={handleUnauthorized} />
        )}
      </main>
    </div>
  );
};

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 md:p-5 ${
        highlight
          ? "bg-teal-500/15 border-teal-500/30"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="font-ppneuemontreal text-white/60 text-[13px] uppercase tracking-wide">
        {label}
      </div>
      <div className="font-roslindaledisplaycondensed text-[32px] md:text-[38px] leading-none mt-1">
        {value}
      </div>
    </div>
  );
}

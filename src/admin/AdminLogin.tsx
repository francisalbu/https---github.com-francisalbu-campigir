import { useState } from "react";
import { login } from "@/admin/api";

export const AdminLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await login(password);
      onSuccess();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-900 flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] bg-white/5 border border-white/15 rounded-[24px] p-7 md:p-8"
      >
        <img
          src="https://www.campigir.com/site/imagens/logo_1.png"
          alt="Campigir"
          className="h-[52px] w-auto object-contain mb-3"
        />
        <p className="font-ppneuemontreal text-white/60 text-[15px] mb-7">
          Backoffice · Gestão de Reservas
        </p>

        <label className="block mb-5">
          <span className="font-ppneuemontreal text-white/70 text-[13px] uppercase tracking-wide">
            Password
          </span>
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-[18px] border border-white/25 bg-white/5 px-4 py-3 text-white placeholder-white/30 font-ppneuemontreal text-[16px] outline-none focus:border-teal-600"
          />
        </label>

        {error && (
          <p className="text-red-300 font-ppneuemontreal text-[14px] mb-4">
            Password incorreta.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white text-rose-900 font-mangogrotesque uppercase text-[22px] tracking-wide py-3.5 active:scale-[0.99] transition disabled:opacity-60"
        >
          {loading ? "…" : "Entrar"}
        </button>
      </form>
    </div>
  );
};

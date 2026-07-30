import { useCallback, useEffect, useState } from "react";
import {
  clearToken,
  createExperience,
  deleteExperience,
  fetchAdminExperiences,
  updateExperience,
  UnauthorizedError,
  type AdminExperience,
  type ExperienceInput,
  type ExperienceType,
} from "@/admin/api";

type Props = {
  onUnauthorized: () => void;
  onDataChange: () => void;
  filterType: ExperienceType;
};

type FormState = {
  id?: string;
  type: ExperienceType;
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  location: string;
  imageSrc: string;
  href: string;
  duration: string;
  price: string;
  pricePerHour: string;
  perDay: boolean;
  capacity: string;
  active: boolean;
  // Tiered rental pricing (euros).
  th2: string;
  tDaily: string;
  td1: string;
  td3: string;
  td5: string;
  tWeek: string;
};

const EMPTY_FORM: FormState = {
  type: "experience",
  titlePt: "",
  titleEn: "",
  descriptionPt: "",
  descriptionEn: "",
  location: "",
  imageSrc: "",
  href: "",
  duration: "",
  price: "",
  pricePerHour: "",
  perDay: true,
  capacity: "10",
  active: true,
  th2: "",
  tDaily: "",
  td1: "",
  td3: "",
  td5: "",
  tWeek: "",
};

function toForm(e: AdminExperience): FormState {
  return {
    id: e.id,
    type: e.type,
    titlePt: e.title.pt,
    titleEn: e.title.en,
    descriptionPt: e.description?.pt ?? "",
    descriptionEn: e.description?.en ?? "",
    location: e.location ?? "",
    imageSrc: e.imageSrc ?? "",
    href: e.href ?? "",
    duration: e.duration ?? "",
    price: e.price ?? "",
    pricePerHour: e.pricePerHour ?? "",
    perDay: !!e.perDay,
    capacity: String(e.capacity ?? 10),
    active: e.active,
    th2: e.pricing?.h2 != null ? String(e.pricing.h2) : "",
    tDaily: e.pricing?.daily != null ? String(e.pricing.daily) : "",
    td1: e.pricing?.d1 != null ? String(e.pricing.d1) : "",
    td3: e.pricing?.d3 != null ? String(e.pricing.d3) : "",
    td5: e.pricing?.d5 != null ? String(e.pricing.d5) : "",
    tWeek: e.pricing?.week != null ? String(e.pricing.week) : "",
  };
}

function toInput(f: FormState): ExperienceInput {
  const isRental = f.type === "rental";
  const num = (s: string) =>
    s.trim() === "" ? undefined : Number(s.trim());
  const tiers = {
    h2: num(f.th2),
    daily: num(f.tDaily),
    d1: num(f.td1),
    d3: num(f.td3),
    d5: num(f.td5),
    week: num(f.tWeek),
  };
  const hasTiers = Object.values(tiers).some((v) => v !== undefined);
  return {
    id: f.id,
    type: f.type,
    title: { pt: f.titlePt.trim(), en: (f.titleEn || f.titlePt).trim() },
    description: { pt: f.descriptionPt.trim(), en: f.descriptionEn.trim() },
    location: f.location.trim(),
    imageSrc: f.imageSrc.trim() || null,
    imageAlt: f.titlePt.trim(),
    href: f.href.trim() || null,
    duration: f.duration.trim() || null,
    price: f.price.trim() || null,
    pricePerHour: isRental ? f.pricePerHour.trim() || null : null,
    perDay: isRental ? f.perDay : false,
    capacity: Number(f.capacity) || 0,
    active: f.active,
    pricing: isRental && hasTiers ? tiers : null,
  };
}

export const ExperiencesPanel = ({
  onUnauthorized,
  onDataChange,
  filterType,
}: Props) => {
  const [items, setItems] = useState<AdminExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRentalTab = filterType === "rental";
  const singular = isRentalTab ? "aluguer" : "experiência";
  const plural = isRentalTab ? "alugueres" : "experiências";
  const visible = items.filter((e) => e.type === filterType);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    onUnauthorized();
  }, [onUnauthorized]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchAdminExperiences());
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setError(null);
    setForm({ ...EMPTY_FORM, type: filterType });
  };

  const openEdit = (e: AdminExperience) => {
    setError(null);
    setForm(toForm(e));
  };

  const save = async () => {
    if (!form) return;
    if (!form.titlePt.trim()) {
      setError("O título (PT) é obrigatório.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input = toInput(form);
      if (form.id) {
        await updateExperience(form.id, input);
      } else {
        await createExperience(input);
      }
      setForm(null);
      await load();
      onDataChange();
    } catch (err) {
      if (err instanceof UnauthorizedError) return handleUnauthorized();
      setError(err instanceof Error ? err.message : "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (e: AdminExperience) => {
    try {
      await updateExperience(e.id, { active: !e.active, type: e.type, title: e.title });
      await load();
      onDataChange();
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    }
  };

  const remove = async (e: AdminExperience) => {
    if (
      !window.confirm(
        `Apagar "${e.title.pt}"? As reservas associadas mantêm-se mas a atividade deixa de existir.`,
      )
    ) {
      return;
    }
    try {
      await deleteExperience(e.id);
      await load();
      onDataChange();
    } catch (err) {
      if (err instanceof UnauthorizedError) return handleUnauthorized();
      window.alert(
        err instanceof Error ? err.message : "Não foi possível apagar.",
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="font-ppneuemontreal text-white/60 text-[14px]">
          {visible.length} {visible.length === 1 ? singular : plural}
        </p>
        <button
          onClick={openNew}
          className="rounded-full bg-white text-rose-900 hover:bg-white/90 px-5 py-2 font-ppneuemontreal text-[14px] font-medium transition"
        >
          + {isRentalTab ? "Novo aluguer" : "Nova experiência"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/60 font-ppneuemontreal">
          A carregar…
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-white/60 font-ppneuemontreal">
          Ainda não há {plural}. Clica em “+ {isRentalTab ? "Novo aluguer" : "Nova experiência"}”.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((e) => (
            <div
              key={e.id}
              className={`rounded-[18px] border p-4 flex flex-col gap-3 ${
                e.active
                  ? "border-white/10 bg-white/5"
                  : "border-white/10 bg-white/[0.02] opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                {e.imageSrc ? (
                  <img
                    src={e.imageSrc}
                    alt={e.imageAlt ?? ""}
                    className="w-16 h-16 rounded-[12px] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-[12px] bg-white/10 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-ppneuemontreal font-medium truncate">
                    {e.title.pt}
                  </div>
                  <div className="text-white/50 text-[13px] font-ppneuemontreal">
                    {e.type === "rental" ? "Aluguer" : "Experiência"}
                    {e.location ? ` · ${e.location}` : ""}
                  </div>
                  <div className="text-white/60 text-[13px] font-ppneuemontreal mt-1">
                    {e.type === "rental"
                      ? `${e.pricePerHour ?? e.price} €/h · base ${e.price} €`
                      : `${e.price} € · ${e.duration ?? "?"}h`}{" "}
                    · cap. {e.capacity}
                  </div>
                  {e.type === "rental" && e.pricing && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[
                        ["2h", e.pricing.h2],
                        ["diário", e.pricing.daily],
                        ["24h", e.pricing.d1],
                        ["3d", e.pricing.d3],
                        ["5d", e.pricing.d5],
                        ["1sem", e.pricing.week],
                      ]
                        .filter(([, v]) => v != null && v !== "")
                        .map(([label, v]) => (
                          <span
                            key={label}
                            className="rounded-[6px] bg-white/10 px-1.5 py-0.5 font-ppneuemontreal text-[11px] text-white/70"
                          >
                            {label} {v}€
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ppneuemontreal text-[12px] ${
                    e.active
                      ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                      : "bg-white/5 text-white/50 border-white/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      e.active ? "bg-teal-500" : "bg-white/40"
                    }`}
                  />
                  {e.active ? "Ativa" : "Inativa"}
                </span>
                <button
                  onClick={() => openEdit(e)}
                  className="rounded-full border border-white/25 hover:bg-white/10 px-3 py-1.5 font-ppneuemontreal text-[13px] transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(e)}
                  className="rounded-full border border-white/25 hover:bg-white/10 px-3 py-1.5 font-ppneuemontreal text-[13px] transition"
                >
                  {e.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => remove(e)}
                  className="rounded-full border border-red-400/30 text-red-300 hover:bg-red-400/10 px-3 py-1.5 font-ppneuemontreal text-[13px] transition"
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <ExperienceForm
          form={form}
          setForm={setForm}
          onClose={() => setForm(null)}
          onSave={save}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-ppneuemontreal text-white/60 text-[13px] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[12px] border border-white/25 bg-white/5 px-3 py-2 font-ppneuemontreal text-[14px] outline-none focus:border-teal-500 [color-scheme:dark]";

function ExperienceForm({
  form,
  setForm,
  onClose,
  onSave,
  saving,
  error,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm({ ...form, [key]: value });
  const isRental = form.type === "rental";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-rose-900 border border-white/15 rounded-[22px] w-full max-w-[640px] my-8 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-roslindaledisplaycondensed text-[28px] leading-none">
            {form.id ? "Editar atividade" : "Nova atividade"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-[12px] border border-red-400/30 bg-red-400/10 text-red-200 px-3 py-2 font-ppneuemontreal text-[13px]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as ExperienceType)}
              className={inputCls}
            >
              <option value="experience" className="text-black">
                Experiência
              </option>
              <option value="rental" className="text-black">
                Aluguer
              </option>
            </select>
          </Field>
          <Field label="Capacidade / dia">
            <input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Título (PT)">
            <input
              value={form.titlePt}
              onChange={(e) => set("titlePt", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Título (EN)">
            <input
              value={form.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Descrição (PT)">
            <textarea
              value={form.descriptionPt}
              onChange={(e) => set("descriptionPt", e.target.value)}
              rows={2}
              className={inputCls}
            />
          </Field>
          <Field label="Descrição (EN)">
            <textarea
              value={form.descriptionEn}
              onChange={(e) => set("descriptionEn", e.target.value)}
              rows={2}
              className={inputCls}
            />
          </Field>
          <Field label="Localização">
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={isRental ? "Duração base (h)" : "Duração (h)"}>
            <input
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={isRental ? "Preço base (€)" : "Preço (€)"}>
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className={inputCls}
            />
          </Field>
          {isRental && (
            <Field label="Preço por hora (€)">
              <input
                value={form.pricePerHour}
                onChange={(e) => set("pricePerHour", e.target.value)}
                className={inputCls}
              />
            </Field>
          )}
          <Field label="Imagem (URL)">
            <input
              value={form.imageSrc}
              onChange={(e) => set("imageSrc", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Link externo (opcional)">
            <input
              value={form.href}
              onChange={(e) => set("href", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {isRental && (
          <div className="mt-5">
            <p className="font-ppneuemontreal text-white/60 text-[13px] mb-2">
              Tabela de preços por período (€) — opcional
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="2 Horas">
                <input
                  value={form.th2}
                  onChange={(e) => set("th2", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Diário (10h-18h)">
                <input
                  value={form.tDaily}
                  onChange={(e) => set("tDaily", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="1 Dia (24h)">
                <input
                  value={form.td1}
                  onChange={(e) => set("td1", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="3 Dias">
                <input
                  value={form.td3}
                  onChange={(e) => set("td3", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="5 Dias">
                <input
                  value={form.td5}
                  onChange={(e) => set("td5", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="1 Semana">
                <input
                  value={form.tWeek}
                  onChange={(e) => set("tWeek", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-5 mt-4">
          {isRental && (
            <label className="flex items-center gap-2 font-ppneuemontreal text-[14px]">
              <input
                type="checkbox"
                checked={form.perDay}
                onChange={(e) => set("perDay", e.target.checked)}
                className="w-4 h-4 accent-teal-500"
              />
              Preço base por dia
            </label>
          )}
          <label className="flex items-center gap-2 font-ppneuemontreal text-[14px]">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="w-4 h-4 accent-teal-500"
            />
            Ativa (visível no site)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="rounded-full border border-white/25 hover:bg-white/10 px-5 py-2 font-ppneuemontreal text-[14px] transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-white text-rose-900 hover:bg-white/90 px-6 py-2 font-ppneuemontreal text-[14px] font-medium transition disabled:opacity-50"
          >
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

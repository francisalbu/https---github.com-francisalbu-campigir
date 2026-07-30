import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "pt" | "en";

/** Nested dictionary of translations. */
const messages = {
  pt: {
    header: { cta: "Ver Atividades" },
    nav: {
      home: "Início",
      experiences: "Experiências",
      rentals: "Alugar Material",
      about: "Sobre",
      contact: "Contactos",
    },
    langToggle: { label: "Idioma" },
    hero: {
      top: "DESCOBRE",
      title: "Atividades",
      bottom: "NA CAMPIGIR",
      badge: "Feito para ti, pela Campigir",
    },
    filters: {
      all: "Tudo",
      experience: "Experiências",
      rental: "Alugar Material",
      empty: "Não há atividades para este filtro.",
    },
    card: { hours: "Horas", from: "Desde", day: "Dia", book: "Reservar" },
    booking: {
      title: "Reserva",
      close: "Fechar",
      date: "Data",
      time: "Hora de início",
      people: "Nº de pessoas",
      person: "pessoa",
      people_plural: "pessoas",
      hours: "Nº de horas",
      hour: "hora",
      hours_plural: "horas",
      period: "Período",
      checkIn: "Hora de check-in",
      dailyHours: "Check-in obrigatório às 10h e check-out às 18h.",
      quantity: "Quantidade",
      unit: "unidade",
      unit_plural: "unidades",
      name: "Nome",
      namePlaceholder: "O teu nome",
      email: "Email",
      emailPlaceholder: "o.teu@email.pt",
      phone: "Telemóvel",
      phonePlaceholder: "+351 900 000 000",
      notes: "Notas (opcional)",
      notesPlaceholder: "Alguma informação adicional?",
      perHour: "/ hora",
      perPerson: "/ pessoa",
      total: "Total",
      confirm: "Confirmar reserva",
      required: "Preenche os campos obrigatórios.",
      successTitle: "Reserva Confirmada",
      successText: "",
      summaryTitle: "Resumo da reserva",
      ref: "ID da reserva",
      item: "Aluguer",
      activity: "Atividade",
      when: "Data",
      downloadDoc: "Descarregar comprovativo",
      docNote: "Apresenta este comprovativo na receção para efetuares o pagamento e levantamento.",
      done: "Concluir",
    },
    intro: {
      text: "Do surf ao trekking pela costa, da canoagem à observação de golfinhos — vive o ar livre e o mar com todo o conforto, à maneira da Campigir.",
      cta: "Ver Atividades",
    },
    marquee: {
      surf: "SURF",
      trekking: "TREKKING",
      canoe: "CANOAGEM",
      bike: "BICICLETAS",
      paddle: "PADDLE",
      dolphins: "GOLFINHOS",
    },
    cookie: {
      text: "Utilizamos cookies para lhe oferecer a melhor experiência no nosso website.",
      customize: "Personalizar",
      decline: "Recusar",
      accept: "Aceitar",
    },
    footer: {
      tagline: "Parques de campismo em Portugal, junto à natureza e ao mar.",
      navigation: "Navegação",
      parks: "Parques",
      social: "Redes",
      privacyPre: "Respeitamos a sua",
      privacy: "privacidade",
      copyright: "© Campigir 2026",
      builtBy: "Built by Bored Tourist",
    },
  },
  en: {
    header: { cta: "View Activities" },
    nav: {
      home: "Home",
      experiences: "Experiences",
      rentals: "Rentals",
      about: "About",
      contact: "Contact",
    },
    langToggle: { label: "Language" },
    hero: {
      top: "DISCOVER",
      title: "Activities",
      bottom: "AT CAMPIGIR",
      badge: "Made for you, by Campigir",
    },
    filters: {
      all: "All",
      experience: "Experiences",
      rental: "Rentals",
      empty: "No activities match this filter.",
    },
    card: { hours: "Hours", from: "From", day: "Day", book: "Book" },
    booking: {
      title: "Booking",
      close: "Close",
      date: "Date",
      time: "Start time",
      people: "Number of people",
      person: "person",
      people_plural: "people",
      hours: "Number of hours",
      hour: "hour",
      hours_plural: "hours",
      period: "Period",
      checkIn: "Check-in time",
      dailyHours: "Mandatory check-in at 10am and check-out at 6pm.",
      quantity: "Quantity",
      unit: "unit",
      unit_plural: "units",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "your@email.com",
      phone: "Phone",
      phonePlaceholder: "+351 900 000 000",
      notes: "Notes (optional)",
      notesPlaceholder: "Any additional info?",
      perHour: "/ hour",
      perPerson: "/ person",
      total: "Total",
      confirm: "Confirm booking",
      required: "Please fill in the required fields.",
      successTitle: "Booking Confirmed",
      successText: "",
      summaryTitle: "Booking summary",
      ref: "Booking ID",
      item: "Rental",
      activity: "Activity",
      when: "Date",
      downloadDoc: "Download voucher",
      docNote: "Present this voucher at reception to complete payment and collect your rental.",
      done: "Done",
    },
    intro: {
      text: "From surfing to coastal trekking, canoeing to dolphin watching — live the outdoors and the sea in comfort, the Campigir way.",
      cta: "View Activities",
    },
    marquee: {
      surf: "SURF",
      trekking: "TREKKING",
      canoe: "CANOEING",
      bike: "BICYCLES",
      paddle: "PADDLE",
      dolphins: "DOLPHINS",
    },
    cookie: {
      text: "We are using cookies to give you the best experience on our website.",
      customize: "Customize",
      decline: "Decline",
      accept: "Accept",
    },
    footer: {
      tagline: "Camping sites across Portugal, close to nature and the sea.",
      navigation: "Navigation",
      parks: "Parks",
      social: "Social",
      privacyPre: "We respect your",
      privacy: "privacy",
      copyright: "© Campigir 2026",
      builtBy: "Built by Bored Tourist",
    },
  },
} as const;

/** Resolve a dot-path like "hero.title" against the active dictionary. */
function resolve(dict: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : path;
}

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("lang");
  if (stored === "pt" || stored === "en") return stored;
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return langs.some((l) => l.toLowerCase().startsWith("pt")) ? "pt" : "en";
}

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => detectLang());

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem("lang", lang);
    } catch {
      /* ignore storage errors */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "pt" ? "en" : "pt")),
    [],
  );

  const t = useCallback(
    (key: string) => resolve(messages[lang], key),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

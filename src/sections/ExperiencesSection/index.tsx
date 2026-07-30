import { useEffect, useMemo, useState } from "react";
import {
  ExperienceFilters,
  type FilterValue,
} from "@/sections/ExperiencesSection/components/ExperienceFilters";
import { ExperienceGrid } from "@/sections/ExperiencesSection/components/ExperienceGrid";
import { BookingModal } from "@/components/BookingModal";
import { fetchExperiences, type Experience } from "@/data/experiences";
import { useI18n } from "@/i18n/i18n";

export const ExperiencesSection = () => {
  const { t } = useI18n();
  const [active, setActive] = useState<FilterValue>("all");
  const [items, setItems] = useState<Experience[]>([]);
  const [booking, setBooking] = useState<Experience | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let alive = true;
    fetchExperiences()
      .then((data) => {
        if (!alive) return;
        setItems(data);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      active === "all"
        ? items
        : items.filter((experience) => experience.type === active),
    [active, items],
  );

  return (
    <section id="experiences" className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px] scroll-mt-[120px]">
      <div className="box-border caret-transparent text-[16.0982px] h-[49.5714px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[75.4286px] md:leading-[26.5714px]"></div>
      <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] max-w-[1671.53px] outline-[3px] relative no-underline align-bottom w-[calc(100%_-_35.1429px)] mx-auto md:text-[17.7143px] md:leading-[26.5714px] md:max-w-[1619.81px] md:w-[calc(100%_-_86.8571px)]">
        <div className="items-stretch box-border caret-transparent flex flex-col text-[16.0982px] justify-start leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <ExperienceFilters active={active} onChange={setActive} />
          <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
            {status === "loading" && (
              <div className="text-center py-16 md:py-24 text-white/80 font-ppneuemontreal text-[20px] md:text-[24px]">
                …
              </div>
            )}
            {status === "error" && (
              <div className="text-center py-16 md:py-24 text-white/80 font-ppneuemontreal text-[18px] md:text-[22px]">
                {t("filters.empty")}
              </div>
            )}
            {status === "ready" && (
              <ExperienceGrid experiences={filtered} onBook={setBooking} />
            )}
          </div>
        </div>
      </div>
      <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
      <BookingModal experience={booking} onClose={() => setBooking(null)} />
    </section>
  );
};

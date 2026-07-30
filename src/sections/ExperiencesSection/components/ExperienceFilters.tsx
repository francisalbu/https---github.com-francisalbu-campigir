import { useI18n } from "@/i18n/i18n";
import type { ExperienceType } from "@/data/experiences";

export type FilterValue = ExperienceType | "all";

export type ExperienceFiltersProps = {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
};

const OPTIONS: { value: FilterValue; labelKey: string }[] = [
  { value: "all", labelKey: "filters.all" },
  { value: "experience", labelKey: "filters.experience" },
  { value: "rental", labelKey: "filters.rental" },
];

export const ExperienceFilters = ({
  active,
  onChange,
}: ExperienceFiltersProps) => {
  const { t } = useI18n();

  return (
    <div className="box-border no-underline w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mb-[32.3929px] pb-[16px] md:overflow-visible md:mb-[38.8571px] md:pb-[38.8571px]">
      <div
        role="tablist"
        aria-label={t("filters.all")}
        className="items-center box-border flex gap-x-[12px] justify-start w-max md:w-auto md:flex-wrap"
      >
        {OPTIONS.map((option) => {
          const isActive = option.value === active;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.value)}
              className={[
                "items-center box-border flex h-[64.3929px] justify-center relative text-center align-bottom border px-[32.3929px] rounded-[375px] border-solid whitespace-nowrap select-none",
                "transition-colors duration-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
                "md:h-[70.8571px] md:px-[38.8571px] md:rounded-[1280px]",
                isActive
                  ? "bg-white text-zinc-900 border-white"
                  : "bg-transparent text-white border-stone-400 hover:text-zinc-900 hover:bg-white/90",
              ].join(" ")}
            >
              <span className="box-border relative text-[18.0982px] leading-[27.1473px] z-[1] font-ppneuemontreal font-medium md:text-[19.7143px] md:leading-[29.5714px]">
                {t(option.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

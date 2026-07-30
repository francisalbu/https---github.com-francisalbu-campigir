import { ExperienceCard } from "@/sections/ExperiencesSection/components/ExperienceCard";
import { useI18n } from "@/i18n/i18n";
import type { Experience } from "@/data/experiences";

export type ExperienceGridProps = {
  experiences: Experience[];
  onBook: (experience: Experience) => void;
};

export const ExperienceGrid = ({ experiences, onBook }: ExperienceGridProps) => {
  const { t } = useI18n();

  if (experiences.length === 0) {
    return (
      <div className="box-border text-center py-16 md:py-24">
        <p className="text-white/80 text-[20px] md:text-[24px] font-ppneuemontreal">
          {t("filters.empty")}
        </p>
      </div>
    );
  }

  return (
    <div
      role="list"
      className="box-border caret-transparent gap-x-[36.5893px] grid text-[16.0982px] auto-cols-[minmax(0px,1fr)] grid-cols-[repeat(auto-fill,minmax(min(max(320px,100%_+_0px),100%),1fr))] grid-rows-[auto] leading-[24.1473px] outline-[3px] gap-y-[36.5893px] no-underline align-bottom md:gap-x-[46.2857px] md:text-[17.7143px] md:grid-cols-[repeat(auto-fill,minmax(min(max(320px,50%_-_23.1429px),100%),1fr))] md:leading-[26.5714px] md:gap-y-[46.2857px]"
    >
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          onBook={onBook}
        />
      ))}
    </div>
  );
};

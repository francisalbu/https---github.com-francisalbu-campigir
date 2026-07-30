import { useI18n } from "@/i18n/i18n";
import { lowestPrice, typeLabel, type Experience } from "@/data/experiences";

export type ExperienceCardProps = {
  experience: Experience;
  onBook: (experience: Experience) => void;
};

export const ExperienceCard = ({ experience, onBook }: ExperienceCardProps) => {
  const { t, lang } = useI18n();
  const title = experience.title[lang];
  const category = typeLabel(experience.type, lang);
  const fromPrice = lowestPrice(experience);

  return (
    <div
      role="listitem"
      className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]"
    >
      <button
        type="button"
        onClick={() => onBook(experience)}
        className="box-border caret-transparent inline-block text-[16.0982px] leading-[24.1473px] max-w-full outline-offset-[3px] outline-2 no-underline align-bottom w-full text-left cursor-pointer md:text-[17.7143px] md:leading-[26.5714px] hover:outline-0"
      >
        <div className="aspect-[666_/_424] box-border caret-transparent basis-[0%] grow text-[16.0982px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom overflow-hidden rounded-[32px] md:text-[17.7143px] md:leading-[26.5714px]">
          <div className="box-border caret-transparent text-[16.0982px] h-full leading-[24.1473px] outline-[3px] absolute no-underline align-bottom w-full z-0 inset-[0%] md:text-[17.7143px] md:leading-[26.5714px]">
            <img
              src={experience.imageSrc}
              alt={experience.imageAlt}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              decoding="async"
              className="box-border caret-transparent text-[16.0982px] h-full leading-[24.1473px] max-w-full object-cover outline-[3px] absolute no-underline w-full inset-[0%] md:text-[17.7143px] md:leading-[26.5714px]"
            />
          </div>
          <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] absolute no-underline align-bottom left-[20.1964px] top-[20.1964px] md:text-[17.7143px] md:leading-[26.5714px] md:left-[23.4286px] md:top-[23.4286px]">
            <div className="box-border caret-transparent text-zinc-900 text-[16.0982px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom z-[1] overflow-hidden px-[20.1964px] py-[10.0982px] rounded-[32px] md:text-[17.7143px] md:leading-[26.5714px] md:px-[23.4286px] md:py-[11.7143px]">
              <span className="box-border caret-transparent flow-root text-[24.3929px] font-normal tracking-[0.487857px] leading-[24.3929px] outline-[3px] text-center no-underline uppercase align-bottom font-mangogrotesque md:text-[30.8571px] md:tracking-[0.617143px] md:leading-[30.8571px] md:text-start">
                {category}
              </span>
              <div className="bg-rose-100 box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] pointer-events-none absolute no-underline align-bottom z-[-2] inset-[0%] md:text-[17.7143px] md:leading-[26.5714px]"></div>
            </div>
          </div>
        </div>
        <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom pt-[28.1964px] md:text-[17.7143px] md:leading-[26.5714px] md:pt-[31.4286px]">
          <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom mb-[14.0982px] pb-[14.0982px] border-b border-white md:text-[17.7143px] md:leading-[26.5714px] md:mb-[15.7143px] md:pb-[15.7143px]">
            <h2 className="box-border caret-transparent flow-root text-[29.375px] font-normal tracking-[-0.29375px] leading-[32.3125px] outline-[3px] no-underline align-bottom font-roslindaledisplaycondensed md:text-[52px] md:tracking-[-0.52px] md:leading-[57.2px]">
              {title}
            </h2>
          </div>
          <div className="content-center items-center box-border caret-transparent flex flex-wrap gap-[8px] text-[16.0982px] justify-start leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
            <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom z-[1] overflow-hidden px-[20.1964px] py-[10.0982px] rounded-[32px] md:text-[17.7143px] md:leading-[26.5714px] md:px-[23.4286px] md:py-[11.7143px]">
              <span className="box-border caret-transparent flow-root text-[24.3929px] font-normal tracking-[0.487857px] leading-[24.3929px] outline-[3px] text-center no-underline uppercase align-bottom font-mangogrotesque md:text-[30.8571px] md:tracking-[0.617143px] md:leading-[30.8571px] md:text-start">
                {t("card.from")} {fromPrice} €
              </span>
              <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] pointer-events-none absolute no-underline align-bottom z-[-2] border rounded-[32px] border-solid border-white inset-[0%] md:text-[17.7143px] md:leading-[26.5714px]"></div>
            </div>
            <div className="box-border caret-transparent relative z-[1] overflow-hidden px-[20.1964px] py-[10.0982px] rounded-[32px] bg-rose-900 md:px-[23.4286px] md:py-[11.7143px]">
              <span className="box-border caret-transparent flow-root text-[24.3929px] font-normal tracking-[0.487857px] leading-[24.3929px] text-center text-white uppercase align-bottom font-mangogrotesque md:text-[30.8571px] md:tracking-[0.617143px] md:leading-[30.8571px]">
                {t("card.book")}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

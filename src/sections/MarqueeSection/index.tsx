import { MarqueeRow } from "@/sections/MarqueeSection/components/MarqueeRow";
import { useI18n } from "@/i18n/i18n";

export const MarqueeSection = () => {
  const { t } = useI18n();
  return (
    <section className="box-border caret-transparent text-zinc-900 text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
      <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
      <div className="items-center box-border caret-transparent flex flex-col text-[16.0982px] justify-center leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
        <div className="bg-teal-600 box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline rotate-[-4.000001701562398deg] align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <MarqueeRow
            direction="left"
            firstLabel={t("marquee.surf")}
            firstIcon="surf"
            secondLabel={t("marquee.trekking")}
            secondIcon="sun"
          />
        </div>
        <div className="bg-rose-100 box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline rotate-[4.000001701562398deg] align-bottom z-[2] md:text-[17.7143px] md:leading-[26.5714px]">
          <MarqueeRow
            direction="right"
            firstLabel={t("marquee.canoe")}
            firstIcon="canoe"
            secondLabel={t("marquee.paddle")}
            secondIcon="paddle"
          />
        </div>
        <div className="bg-red-300 box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline rotate-[-4.000001701562398deg] align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <MarqueeRow
            direction="left"
            firstLabel={t("marquee.bike")}
            firstIcon="bike"
            secondLabel={t("marquee.dolphins")}
            secondIcon="wave"
          />
        </div>
      </div>
      <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
    </section>
  );
};

import { useI18n } from "@/i18n/i18n";

export const FooterBrand = () => {
  const { t } = useI18n();
  return (
    <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
      <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
        <div className="box-border caret-transparent no-underline align-bottom">
          <span className="font-roslindaledisplaycondensed font-bold text-white text-[32px] leading-none tracking-[-0.02em] md:text-[40px]">
            Campigir
          </span>
        </div>
        <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] max-w-[145.862px] outline-[3px] no-underline align-bottom mt-[20.1964px] md:text-[17.7143px] md:leading-[26.5714px] md:max-w-[160.602px] md:mt-[23.4286px]">
          <div className="box-border caret-transparent flow-root text-[14.0982px] leading-[21.1473px] outline-[3px] no-underline align-bottom md:text-[15.7143px] md:leading-[23.5714px] before:accent-auto before:box-border before:caret-transparent before:text-white before:table before:text-[14.0982px] before:not-italic before:normal-nums before:font-medium before:tracking-[normal] before:leading-[21.1473px] before:list-outside before:list-disc before:mb-[-4.64906px] before:outline-[3px] before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-ppneuemontreal before:md:text-[15.7143px] before:md:leading-[23.5714px] before:md:mb-[-5.17344px] after:accent-auto after:box-border after:caret-transparent after:text-white after:table after:text-[14.0982px] after:not-italic after:normal-nums after:font-medium after:tracking-[normal] after:leading-[21.1473px] after:list-outside after:list-disc after:mb-[-6.34085px] after:outline-[3px] after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-ppneuemontreal after:md:text-[15.7143px] after:md:leading-[23.5714px] after:md:mb-[-7.05915px]">
            {t("footer.tagline")}
          </div>
        </div>
      </div>
    </div>
  );
};

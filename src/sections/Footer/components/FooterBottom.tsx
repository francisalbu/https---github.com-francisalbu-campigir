import { useI18n } from "@/i18n/i18n";

export const FooterBottom = () => {
  const { t } = useI18n();
  return (
    <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
      <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom mb-[28.1964px] p-0 text-center md:text-[17.7143px] md:leading-[26.5714px] md:mb-[31.4286px] md:py-[60.5714px]">
        <span className="font-roslindaledisplaycondensed font-bold text-white leading-none tracking-[-0.03em] text-[64px] md:text-[180px]">
          Campigir
        </span>
      </div>
      <div className="box-border caret-transparent gap-x-[20.1964px] grid text-[16.0982px] auto-cols-[minmax(0px,1fr)] grid-cols-[repeat(auto-fit,minmax(min(max(128px,50%_-_10.0982px),100%),1fr))] grid-rows-[auto] leading-[24.1473px] outline-[3px] gap-y-[20.1964px] no-underline align-bottom pt-[28.1964px] border-t border-white md:gap-x-[23.4286px] md:text-[17.7143px] md:grid-cols-[repeat(auto-fit,minmax(min(max(128px,50%_-_11.7143px),100%),1fr))] md:leading-[26.5714px] md:gap-y-[23.4286px] md:pt-[31.4286px]">
        <div className="box-border caret-transparent text-[16.0982px] justify-self-start leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <div className="box-border caret-transparent flow-root text-[14.0982px] leading-[21.1473px] outline-[3px] no-underline align-bottom md:text-[15.7143px] md:leading-[23.5714px] before:accent-auto before:box-border before:caret-transparent before:text-white before:table before:text-[14.0982px] before:not-italic before:normal-nums before:font-medium before:tracking-[normal] before:leading-[21.1473px] before:list-outside before:list-disc before:mb-[-4.64906px] before:outline-[3px] before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-ppneuemontreal before:md:text-[15.7143px] before:md:leading-[23.5714px] before:md:mb-[-5.17344px] after:accent-auto after:box-border after:caret-transparent after:text-white after:table after:text-[14.0982px] after:not-italic after:normal-nums after:font-medium after:tracking-[normal] after:leading-[21.1473px] after:list-outside after:list-disc after:mb-[-6.34085px] after:outline-[3px] after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-ppneuemontreal after:md:text-[15.7143px] after:md:leading-[23.5714px] after:md:mb-[-7.05915px]">
            {t("footer.copyright")}
            <span className="block text-white/60 mt-1">{t("footer.builtBy")}</span>
          </div>
        </div>
        <div className="box-border caret-transparent text-[16.0982px] justify-self-end leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <div className="box-border caret-transparent flow-root text-[14.0982px] leading-[21.1473px] outline-[3px] no-underline align-bottom md:text-[15.7143px] md:leading-[23.5714px] before:accent-auto before:box-border before:caret-transparent before:text-white before:table before:text-[14.0982px] before:not-italic before:normal-nums before:font-medium before:tracking-[normal] before:leading-[21.1473px] before:list-outside before:list-disc before:mb-[-4.64906px] before:outline-[3px] before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-ppneuemontreal before:md:text-[15.7143px] before:md:leading-[23.5714px] before:md:mb-[-5.17344px] after:accent-auto after:box-border after:caret-transparent after:text-white after:table after:text-[14.0982px] after:not-italic after:normal-nums after:font-medium after:tracking-[normal] after:leading-[21.1473px] after:list-outside after:list-disc after:mb-[-6.34085px] after:outline-[3px] after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-ppneuemontreal after:md:text-[15.7143px] after:md:leading-[23.5714px] after:md:mb-[-7.05915px]">
            {t("footer.privacyPre")}{" "}
            <a
              href="https://www.campigir.com/pt/politica-privacidade"
              className="box-border caret-transparent text-[14.0982px] leading-[21.1473px] outline-offset-[3px] outline-2 underline align-bottom md:text-[15.7143px] md:leading-[23.5714px] hover:outline-0"
            >
              {t("footer.privacy")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useI18n } from "@/i18n/i18n";

export const IntroText = () => {
  const { t } = useI18n();
  return (
    <div className="box-border caret-transparent block text-[33.5714px] font-normal tracking-[-0.335714px] leading-[50.3571px] min-h-[auto] min-w-[auto] outline-[3px] text-center no-underline align-bottom font-roslindaledisplaycondensed md:text-[59.4286px] md:tracking-[-0.594286px] md:leading-[89.1429px]">
      {t("intro.text")}
    </div>
  );
};

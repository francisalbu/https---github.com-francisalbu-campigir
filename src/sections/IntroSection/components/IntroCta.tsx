import { useI18n } from "@/i18n/i18n";

export const IntroCta = () => {
  const { t } = useI18n();
  return (
    <a
      href="#experiences"
      className="items-center box-border caret-transparent flex text-[28.1719px] justify-center leading-[28.1719px] max-w-full min-h-[auto] min-w-[auto] outline-offset-[3px] outline-2 relative no-underline align-bottom rounded-[281.719px] md:text-[31px] md:leading-[31px] md:rounded-[310px] hover:outline-0"
    >
      <div className="items-center bg-white box-border caret-transparent flex text-[28.1719px] h-[84.5156px] justify-center leading-[28.1719px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline translate-x-[-84.5156px] align-bottom px-[56.3438px] rounded-[375px] md:text-[31px] md:h-[108.5px] md:leading-[31px] md:translate-x-[-108.5px] md:px-[62px] md:rounded-[1280px]">
        <span className="box-border caret-transparent block text-[28.1719px] leading-[28.1719px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[31px] md:leading-[31px]">
          {t("intro.cta")}
        </span>
      </div>
      <div className="items-center aspect-square box-border caret-transparent text-neutral-900 flex text-[28.1719px] h-[84.5156px] justify-center leading-[28.1719px] outline-[3px] absolute no-underline origin-[100%_50%] align-bottom w-[84.5156px] z-[2] right-0 md:text-[31px] md:h-[108.5px] md:leading-[31px] md:w-[108.5px]">
        <div className="items-center box-border caret-transparent flex text-[28.1719px] justify-center leading-[28.1719px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom rounded-[281.719px] md:text-[31px] md:leading-[31px] md:rounded-[310px]">
          <div className="items-center aspect-square bg-red-300 box-border caret-transparent text-zinc-900 flex text-[28.1719px] h-[84.5156px] justify-center leading-[28.1719px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom w-[84.5156px] rounded-[375px] md:text-[31px] md:h-full md:leading-[31px] md:w-full md:rounded-[1280px]">
            <img
              src="https://c.animaapp.com/ms4ta1qh3sd42Q/assets/icon-2.svg"
              alt="Icon"
              className="box-border caret-transparent text-[28.1719px] leading-[28.1719px] outline-[3px] no-underline align-bottom w-2/5 md:text-[31px] md:leading-[31px]"
            />
          </div>
        </div>
      </div>
    </a>
  );
};

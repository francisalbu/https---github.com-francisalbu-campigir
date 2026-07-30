import { useI18n } from "@/i18n/i18n";

export const HeaderCta = () => {
  const { t } = useI18n();
  return (
    <a
      href="#experiences"
      className="items-center box-border caret-transparent flex text-[16.0982px] justify-center leading-[16.0982px] max-w-full min-h-0 min-w-0 outline-offset-[3px] outline-2 relative no-underline align-bottom rounded-[160.982px] md:text-[17.7143px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:rounded-[177.143px] hover:outline-0"
    >
      <div className="items-center aspect-square box-border caret-transparent text-neutral-900 flex text-[16.0982px] h-[48.2946px] justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline transform-none origin-[0%_50%] align-bottom w-[48.2946px] md:text-[17.7143px] md:h-[62px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:w-[62px] md:scale-0">
        <div className="items-center box-border caret-transparent flex text-[16.0982px] justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline align-bottom rounded-[160.982px] md:text-[17.7143px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:rounded-[177.143px]">
          <div className="items-center aspect-square bg-rose-100 box-border caret-transparent text-zinc-900 flex text-[16.0982px] h-full justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline align-bottom w-full rounded-[375px] md:text-[17.7143px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:rounded-[1280px]">
            <img
              src="https://c.animaapp.com/ms4ta1qh3sd42Q/assets/icon-2.svg"
              alt="Icon"
              className="box-border caret-transparent text-[16.0982px] leading-[16.0982px] outline-[3px] no-underline align-bottom w-2/5 md:text-[17.7143px] md:leading-[17.7143px]"
            />
          </div>
        </div>
      </div>
      <div className="items-center bg-white box-border caret-transparent flex text-[16.0982px] h-[48.2946px] justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline transform-none align-bottom px-[32.1964px] rounded-[375px] md:text-[17.7143px] md:h-[62px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:translate-x-[-62px] md:px-[35.4286px] md:rounded-[1280px]">
        <span className="box-border caret-transparent block text-[16.0982px] leading-[16.0982px] min-h-0 min-w-0 outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto]">
          {t("header.cta")}
        </span>
      </div>
      <div className="items-center aspect-square box-border caret-transparent text-neutral-900 flex text-[16.0982px] h-[48.2946px] justify-center leading-[16.0982px] outline-[3px] absolute no-underline origin-[100%_50%] align-bottom w-[48.2946px] z-[2] right-0 md:text-[17.7143px] md:h-[62px] md:leading-[17.7143px] md:w-[62px]">
        <div className="items-center box-border caret-transparent flex text-[16.0982px] justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline align-bottom rounded-[160.982px] md:text-[17.7143px] md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:rounded-[177.143px]">
          <div className="items-center aspect-square bg-red-300 box-border caret-transparent text-zinc-900 flex text-[16.0982px] h-[48.2946px] justify-center leading-[16.0982px] min-h-0 min-w-0 outline-[3px] relative no-underline align-bottom w-[48.2946px] rounded-[375px] md:text-[17.7143px] md:h-full md:leading-[17.7143px] md:min-h-[auto] md:min-w-[auto] md:w-full md:rounded-[1280px]">
            <img
              src="https://c.animaapp.com/ms4ta1qh3sd42Q/assets/icon-2.svg"
              alt="Icon"
              className="box-border caret-transparent text-[16.0982px] leading-[16.0982px] outline-[3px] no-underline align-bottom w-2/5 md:text-[17.7143px] md:leading-[17.7143px]"
            />
          </div>
        </div>
      </div>
    </a>
  );
};

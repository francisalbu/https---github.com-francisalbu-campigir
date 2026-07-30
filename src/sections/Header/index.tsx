import { HeaderLogo } from "@/sections/Header/components/HeaderLogo";
import { HeaderCta } from "@/sections/Header/components/HeaderCta";
import { useI18n } from "@/i18n/i18n";

export const Header = () => {
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] fixed no-underline align-bottom z-[1000] top-[0%] inset-x-[0%] md:text-[17.7143px] md:leading-[26.5714px]">
      <div
        role="banner"
        className="items-end box-border caret-transparent flex text-[16.0982px] h-[96.5893px] justify-center leading-[24.1473px] outline-[3px] relative no-underline align-bottom z-[1] md:text-[17.7143px] md:h-[106.286px] md:leading-[26.5714px]"
      >
        <div className="items-center box-border caret-transparent gap-x-[20.1964px] flex text-[16.0982px] h-[96.5893px] justify-between leading-[24.1473px] max-w-[2700px] min-h-[auto] min-w-[auto] outline-[3px] relative gap-y-[20.1964px] no-underline align-bottom w-[calc(100%_-_35.1429px)] mx-auto md:gap-x-[23.4286px] md:text-[17.7143px] md:h-[106.286px] md:leading-[26.5714px] md:gap-y-[23.4286px] md:w-[calc(100%_-_86.8571px)]">
          <HeaderLogo />
          <ul
            role="list"
            className="items-center box-border caret-transparent flex basis-[0%] grow text-[16.0982px] justify-end gap-x-[12px] leading-[24.1473px] list-[''] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom pl-0 md:text-[17.7143px] md:leading-[26.5714px]"
          >
            <li className="box-border caret-transparent flex items-center">
              <button
                type="button"
                onClick={toggleLang}
                aria-label={t("langToggle.label")}
                className="items-center bg-white/10 box-border caret-transparent flex text-white justify-center h-[48.2946px] gap-x-1 leading-none outline-offset-2 relative no-underline align-middle px-4 rounded-[375px] border border-white/40 font-ppneuemontreal font-medium text-[15px] transition-colors hover:bg-white hover:text-zinc-900 md:h-[62px] md:px-5"
              >
                <span className={lang === "pt" ? "opacity-100" : "opacity-50"}>
                  PT
                </span>
                <span className="opacity-40">/</span>
                <span className={lang === "en" ? "opacity-100" : "opacity-50"}>
                  EN
                </span>
              </button>
            </li>
            <li className="box-border caret-transparent hidden text-[16.0982px] leading-[24.1473px] min-h-0 min-w-0 outline-[3px] no-underline align-bottom md:block md:text-[17.7143px] md:leading-[26.5714px] md:min-h-[auto] md:min-w-[auto]">
              <div className="box-border caret-transparent text-zinc-900 text-[16.0982px] leading-[16.0982px] outline-[3px] relative text-center no-underline align-middle md:text-[17.7143px] md:leading-[17.7143px]">
                <div className="box-border caret-transparent gap-x-[48.2946px] flex text-[16.0982px] justify-center leading-[16.0982px] outline-[3px] gap-y-[48.2946px] no-underline align-bottom md:gap-x-[53.1429px] md:text-[17.7143px] md:leading-[17.7143px] md:gap-y-[53.1429px]">
                  <HeaderCta />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

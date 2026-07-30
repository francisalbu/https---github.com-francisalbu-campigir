import { IntroText } from "@/sections/IntroSection/components/IntroText";
import { IntroCta } from "@/sections/IntroSection/components/IntroCta";

export const IntroSection = () => {
  return (
    <section className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom z-[3] md:text-[17.7143px] md:leading-[26.5714px]">
      <div className="box-border caret-transparent text-[16.0982px] h-[91.5357px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[149.714px] md:leading-[26.5714px]"></div>
      <div className="items-center box-border caret-transparent flex flex-col text-[16.0982px] justify-center leading-[24.1473px] max-w-[1092px] outline-[3px] relative no-underline align-bottom w-[calc(100%_-_35.1429px)] mx-auto md:text-[17.7143px] md:leading-[26.5714px] md:w-[calc(100%_-_86.8571px)]">
        <div className="items-center box-border caret-transparent gap-x-[41.1786px] flex flex-col text-[16.0982px] justify-start leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] gap-y-[41.1786px] no-underline align-bottom w-full md:gap-x-[60.5714px] md:text-[17.7143px] md:leading-[26.5714px] md:gap-y-[60.5714px]">
          <IntroText />
          <div className="box-border caret-transparent text-zinc-900 text-[16.0982px] leading-[16.0982px] min-h-[auto] min-w-[auto] outline-[3px] relative text-center no-underline align-middle md:text-[17.7143px] md:leading-[17.7143px]">
            <div className="box-border caret-transparent gap-x-[84.5156px] flex text-[28.1719px] justify-center leading-[28.1719px] outline-[3px] gap-y-[84.5156px] no-underline align-bottom md:gap-x-[93px] md:text-[31px] md:leading-[31px] md:gap-y-[93px]">
              <IntroCta />
            </div>
          </div>
        </div>
      </div>
      <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
    </section>
  );
};

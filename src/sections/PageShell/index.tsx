import { Header } from "@/sections/Header";
import { HeroSection } from "@/sections/HeroSection";
import { ExperiencesSection } from "@/sections/ExperiencesSection";
import { MarqueeSection } from "@/sections/MarqueeSection";
import { IntroSection } from "@/sections/IntroSection";
import { Footer } from "@/sections/Footer";

export const PageShell = () => {
  return (
    <div className="box-border caret-transparent flex flex-col text-[16.0982px] leading-[24.1473px] min-h-[1000px] outline-[3px] no-underline align-bottom overflow-clip md:text-[17.7143px] md:leading-[26.5714px]">
      <div className="bg-rose-900 box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] fixed no-underline align-bottom top-[0%] inset-x-[0%] md:text-[17.7143px] md:leading-[26.5714px]">
        <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px] before:accent-auto before:box-border before:caret-transparent before:text-white before:table before:text-[16.0982px] before:not-italic before:normal-nums before:font-medium before:col-end-2 before:col-start-1 before:row-end-2 before:row-start-1 before:tracking-[normal] before:leading-[24.1473px] before:list-outside before:list-disc before:outline-[3px] before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-ppneuemontreal before:md:text-[17.7143px] before:md:leading-[26.5714px] after:accent-auto after:box-border after:caret-transparent after:clear-both after:text-white after:table after:text-[16.0982px] after:not-italic after:normal-nums after:font-medium after:col-end-2 after:col-start-1 after:row-end-2 after:row-start-1 after:tracking-[normal] after:leading-[24.1473px] after:list-outside after:list-disc after:outline-[3px] after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-ppneuemontreal after:md:text-[17.7143px] after:md:leading-[26.5714px]"></div>
        <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px] before:accent-auto before:box-border before:caret-transparent before:text-white before:table before:text-[16.0982px] before:not-italic before:normal-nums before:font-medium before:col-end-2 before:col-start-1 before:row-end-2 before:row-start-1 before:tracking-[normal] before:leading-[24.1473px] before:list-outside before:list-disc before:outline-[3px] before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-ppneuemontreal before:md:text-[17.7143px] before:md:leading-[26.5714px] after:accent-auto after:box-border after:caret-transparent after:clear-both after:text-white after:table after:text-[16.0982px] after:not-italic after:normal-nums after:font-medium after:col-end-2 after:col-start-1 after:row-end-2 after:row-start-1 after:tracking-[normal] after:leading-[24.1473px] after:list-outside after:list-disc after:outline-[3px] after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-ppneuemontreal after:md:text-[17.7143px] after:md:leading-[26.5714px]"></div>
      </div>
      <Header />
      <div className="bg-rose-900 box-border caret-transparent flex basis-[0%] flex-col grow text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom z-[2] md:text-[17.7143px] md:leading-[26.5714px]">
        <div className="box-border caret-transparent text-[16.0982px] h-full leading-[24.1473px] outline-[3px] pointer-events-none absolute no-underline align-bottom w-screen z-[-1] overflow-clip inset-[0%] md:text-[17.7143px] md:leading-[26.5714px]">
          <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] sticky no-underline align-bottom top-[0%] md:text-[17.7143px] md:leading-[26.5714px]">
            <div className="bg-[linear-gradient(135deg,rgb(67,160,71),rgb(27,94,32))] box-border caret-transparent text-[16.0982px] h-[1000px] leading-[24.1473px] outline-[3px] no-underline align-bottom w-full md:text-[17.7143px] md:leading-[26.5714px]"></div>
          </div>
        </div>
        <HeroSection />
        <ExperiencesSection />
        <MarqueeSection />
        <IntroSection />
      </div>
      <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] mt-[-1000px] min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom z-[1] md:text-[17.7143px] md:leading-[26.5714px]">
        <div className="box-border caret-transparent text-[16.0982px] h-[1000px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]"></div>
        <Footer />
      </div>
    </div>
  );
};

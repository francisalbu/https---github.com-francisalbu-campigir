import { FooterBrand } from "@/sections/Footer/components/FooterBrand";
import { FooterLinks } from "@/sections/Footer/components/FooterLinks";
import { FooterBottom } from "@/sections/Footer/components/FooterBottom";

export const Footer = () => {
  return (
    <footer className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] outline-[3px] sticky no-underline align-bottom pb-[17.5714px] -bottom-96 md:text-[17.7143px] md:leading-[26.5714px] md:pb-[43.4286px] overflow-hidden">
      {/* Background image + overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://i.postimg.cc/Qd7WYSZ0/Creativconteudo-168.jpg')",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-rose-900/20"
      />
      <div className="relative z-[1]">
      <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
      <div className="box-border caret-transparent text-[16.0982px] leading-[24.1473px] max-w-[2700px] outline-[3px] relative no-underline align-bottom w-[calc(100%_-_35.1429px)] mx-auto md:text-[17.7143px] md:leading-[26.5714px] md:w-[calc(100%_-_86.8571px)]">
        <div className="box-border caret-transparent gap-x-12 grid text-[16.0982px] auto-cols-[minmax(0px,1fr)] grid-cols-[repeat(auto-fit,minmax(min(max(128px,33.3333%_-_32px),100%),1fr))] grid-rows-[auto] leading-[24.1473px] outline-[3px] gap-y-12 no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
          <FooterBrand />
          <FooterLinks />
        </div>
        <div className="box-border caret-transparent text-[16.0982px] h-[66.3571px] leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:h-[105.143px] md:leading-[26.5714px]"></div>
        <FooterBottom />
      </div>
      </div>
    </footer>
  );
};

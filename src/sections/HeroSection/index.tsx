import { HeroTitle } from "@/sections/HeroSection/components/HeroTitle";

export const HeroSection = () => {
  return (
    <section className="box-border relative w-[calc(100%_-_35.1429px)] max-w-[1671.53px] mx-auto pt-[96.5893px] md:w-[calc(100%_-_86.8571px)] md:pt-[140px]">
      <div className="relative box-border overflow-hidden rounded-[24px] md:rounded-[40px] min-h-[420px] md:min-h-[600px] flex flex-col items-center justify-center">
        {/* Background photo */}
        <img
          src="./hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>

        {/* Content */}
        <div className="relative z-[1] w-full py-[60px] md:py-[100px]">
          <HeroTitle />
        </div>
      </div>
    </section>
  );
};

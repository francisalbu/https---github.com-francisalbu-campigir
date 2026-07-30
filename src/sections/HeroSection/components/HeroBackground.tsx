// Decorative floating icons in the hero, themed around camping & outdoor
// activities (surf, bikes, canoe, ball, tent, hiking...).
const ICONS: { pos: string; emoji: string; label: string }[] = [
  {
    pos: "translate-x-[305.555px] translate-y-[208.68px] rotate-[-14.87deg] w-[123.253px] md:translate-x-[310.542px] md:translate-y-[212.894px] md:rotate-[-12.88deg] md:w-[135.626px]",
    emoji: "🏄",
    label: "Surf",
  },
  {
    pos: "translate-x-[193.404px] translate-y-[394.304px] rotate-[8.31deg] w-[49.39px] md:translate-x-[208.444px] md:translate-y-[397.679px] md:rotate-[6.97deg] md:w-[54.3481px]",
    emoji: "⚽",
    label: "Bola",
  },
  {
    pos: "translate-x-[691.354px] translate-y-[334.803px] rotate-[10.81deg] w-[83.3847px] md:translate-x-[680.488px] md:translate-y-[367.964px] md:rotate-[6.33deg] md:w-[91.7556px]",
    emoji: "🚲",
    label: "Bicicleta",
  },
  {
    pos: "translate-x-[246.348px] translate-y-[155.299px] rotate-[-13.52deg] w-[122.432px] md:translate-x-[245.238px] md:translate-y-[155.725px] md:rotate-[-13.69deg] md:w-[134.723px]",
    emoji: "⛺",
    label: "Tenda",
  },
  {
    pos: "translate-x-[530.912px] translate-y-[339.171px] rotate-[6.97deg] w-[90.627px] md:translate-x-[528.332px] md:translate-y-[336.183px] md:rotate-[6.99deg] md:w-[99.7249px]",
    emoji: "🛶",
    label: "Canoa",
  },
  {
    pos: "translate-x-[76.1258px] translate-y-[364.529px] rotate-[32.17deg] w-[61.6716px] md:translate-x-[63.2822px] md:translate-y-[356.515px] md:rotate-[34.22deg] md:w-[67.8627px]",
    emoji: "🥾",
    label: "Trekking",
  },
  {
    pos: "translate-x-[241.815px] translate-y-[105.275px] rotate-[20.14deg] w-[83.9908px] md:translate-x-[247.54px] md:translate-y-[107.417px] md:rotate-[19.48deg] md:w-[92.4225px]",
    emoji: "🏐",
    label: "Voleibol",
  },
  {
    pos: "translate-x-[33.369px] translate-y-[20.5661px] rotate-[-18.42deg] w-[68.2181px] md:translate-x-[34.2354px] md:translate-y-[21.2891px] md:rotate-[-17.96deg] md:w-[75.0664px]",
    emoji: "🏕️",
    label: "Campismo",
  },
  {
    pos: "translate-x-[-1.7958px] translate-y-[300.922px] rotate-[-13.31deg] w-[59.4544px] md:translate-x-[-11.8845px] md:translate-y-[296.535px] md:rotate-[-15.12deg] md:w-[65.4229px]",
    emoji: "🐬",
    label: "Golfinho",
  },
  {
    pos: "translate-x-[184.647px] translate-y-[104.352px] rotate-[7.28deg] w-[117.137px] md:translate-x-[180.324px] md:translate-y-[77.6524px] md:rotate-[11.32deg] md:w-[128.896px]",
    emoji: "🏊",
    label: "Natação",
  },
  {
    pos: "translate-x-[297.146px] translate-y-[274.062px] rotate-[13.88deg] w-[74.664px] md:translate-x-[296.811px] md:translate-y-[273.804px] md:rotate-[13.94deg] md:w-[82.1594px]",
    emoji: "🔥",
    label: "Fogueira",
  },
  {
    pos: "translate-x-[344.094px] translate-y-[146.879px] rotate-[26.81deg] w-[124.622px] md:translate-x-[345.118px] md:translate-y-[151.119px] md:rotate-[27.10deg] md:w-[137.132px]",
    emoji: "🎣",
    label: "Pesca",
  },
];

export const HeroBackground = () => {
  return (
    <div className="box-border caret-transparent h-full pointer-events-none absolute align-bottom w-screen inset-[0%]">
      {ICONS.map((icon) => (
        <div
          key={icon.label}
          aria-hidden="true"
          className={`aspect-square box-border caret-transparent absolute align-bottom ${icon.pos}`}
        >
          <span className="flex items-center justify-center w-full h-full leading-none select-none text-[clamp(28px,7vw,88px)]">
            {icon.emoji}
          </span>
        </div>
      ))}
    </div>
  );
};

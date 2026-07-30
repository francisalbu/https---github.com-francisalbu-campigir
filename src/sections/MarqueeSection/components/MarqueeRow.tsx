export type IconKind = "surf" | "paddle" | "wave" | "sun" | "bike" | "canoe";

export type MarqueeRowProps = {
  /** Animation direction of the scrolling lettering. */
  direction?: "left" | "right";
  firstLabel: string;
  firstIcon: IconKind;
  secondLabel: string;
  secondIcon: IconKind;
};

const H2_CLASS =
  "box-border caret-transparent flow-root text-[75px] font-bold tracking-[-1.5px] leading-[75px] outline-[3px] no-underline text-nowrap align-bottom font-roslindaledisplaycondensed md:text-[256px] md:tracking-[-5.12px] md:leading-[256px]";

const ICON_WRAP_CLASS =
  "items-center aspect-square box-border caret-transparent flex shrink-0 h-[64.3929px] justify-center relative no-underline align-bottom w-[64.3929px] mx-[16.0982px] md:h-[204.8px] md:w-[204.8px] md:mx-[25.6px]";

const STROKE = {
  fill: "none",
  stroke: "#18181b",
  strokeWidth: 4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Hand-drawn style surfboard (pointed nose, rounded tail, stringer). */
function SurfIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <path d="M50 6 C68 26 70 56 58 86 C55 93 45 93 42 86 C30 56 32 26 50 6 Z" />
        <line x1="50" y1="14" x2="50" y2="82" strokeWidth={3} />
        <path d="M50 84 C50 90 50 94 50 96" strokeWidth={3} />
      </g>
    </svg>
  );
}

/** Stand-up paddle board with a paddle across it. */
function PaddleIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <path d="M44 8 C56 24 58 58 50 88 C48 94 40 94 38 88 C30 58 32 24 44 8 Z" />
        <line x1="44" y1="18" x2="44" y2="80" strokeWidth={2.5} />
        <line x1="70" y1="14" x2="52" y2="70" strokeWidth={4} />
        <path d="M70 10 L78 8 L74 18 Z" fill="#18181b" stroke="none" />
        <line x1="50" y1="72" x2="54" y2="82" strokeWidth={4} />
      </g>
    </svg>
  );
}

/** Rolling ocean wave. */
function WaveIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <path d="M8 62 C22 40 34 40 44 54 C52 66 64 66 74 52 C82 40 90 42 94 50" />
        <path d="M74 52 C82 56 88 66 84 78 C80 88 66 90 58 82" />
        <path d="M8 78 C24 66 40 68 52 80" />
      </g>
    </svg>
  );
}

/** Simple sun with rays. */
function SunIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <circle cx="50" cy="50" r="20" />
        <line x1="50" y1="10" x2="50" y2="22" />
        <line x1="50" y1="78" x2="50" y2="90" />
        <line x1="10" y1="50" x2="22" y2="50" />
        <line x1="78" y1="50" x2="90" y2="50" />
        <line x1="22" y1="22" x2="31" y2="31" />
        <line x1="69" y1="69" x2="78" y2="78" />
        <line x1="78" y1="22" x2="69" y2="31" />
        <line x1="31" y1="69" x2="22" y2="78" />
      </g>
    </svg>
  );
}

/** Bicycle. */
function BikeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <circle cx="24" cy="70" r="16" />
        <circle cx="76" cy="70" r="16" />
        <path d="M24 70 L44 40 L64 70" />
        <path d="M44 40 L38 40" />
        <path d="M44 40 L62 40 L76 70" />
        <line x1="62" y1="40" x2="68" y2="30" />
      </g>
    </svg>
  );
}

/** Canoe with a paddle. */
function CanoeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <g {...STROKE}>
        <path d="M10 54 C24 74 76 74 90 54 C74 62 26 62 10 54 Z" />
        <line x1="20" y1="57" x2="80" y2="57" strokeWidth={2.5} />
        <line x1="66" y1="16" x2="40" y2="56" strokeWidth={4} />
        <path d="M62 12 L72 12 L68 22 Z" fill="#18181b" stroke="none" />
      </g>
    </svg>
  );
}

function IconByKind({ kind }: { kind: IconKind }) {
  switch (kind) {
    case "surf":
      return <SurfIcon />;
    case "paddle":
      return <PaddleIcon />;
    case "wave":
      return <WaveIcon />;
    case "sun":
      return <SunIcon />;
    case "bike":
      return <BikeIcon />;
    case "canoe":
      return <CanoeIcon />;
    default:
      return <SurfIcon />;
  }
}

function MarqueeIcon({ kind }: { kind: IconKind }) {
  return (
    <div className={ICON_WRAP_CLASS}>
      <IconByKind kind={kind} />
    </div>
  );
}

function RowGroup(props: MarqueeRowProps) {
  return (
    <div className="box-border caret-transparent flex shrink-0 min-h-[auto] min-w-[auto] outline-[3px] relative no-underline align-bottom">
      <div className="items-center box-border caret-transparent flex justify-start outline-[3px] no-underline align-bottom pt-[6.09821px] pb-[10.0982px] md:pt-[7.71429px] md:pb-[11.7143px]">
        <h2 className={H2_CLASS}>{props.firstLabel}</h2>
        <MarqueeIcon kind={props.firstIcon} />
        <h2 className={H2_CLASS}>{props.secondLabel}</h2>
        <MarqueeIcon kind={props.secondIcon} />
      </div>
    </div>
  );
}

export const MarqueeRow = (props: MarqueeRowProps) => {
  const anim =
    props.direction === "right"
      ? "animate-marquee-right"
      : "animate-marquee-left";
  return (
    <div className="box-border caret-transparent flex outline-[3px] relative no-underline align-bottom w-full overflow-hidden">
      <div
        className={`box-border caret-transparent flex w-max outline-[3px] no-underline align-bottom ${anim}`}
      >
        <RowGroup {...props} />
        <RowGroup {...props} />
        <RowGroup {...props} />
      </div>
    </div>
  );
};

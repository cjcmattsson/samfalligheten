import type { CoverKind } from "../demo/data";

const houses = [
  { x: 560, w: 118, h: 74, wall: "#b5432f", roof: "#3c3531" },
  { x: 692, w: 96, h: 66, wall: "#e4c98e", roof: "#594438" },
  { x: 802, w: 128, h: 82, wall: "#f4efe5", roof: "#31424c" },
  { x: 944, w: 104, h: 70, wall: "#7f9aa3", roof: "#2f3a40" },
  { x: 1062, w: 116, h: 78, wall: "#b5432f", roof: "#3c3531" },
];

const trees = [
  [520, 300, 44],
  [476, 306, 36],
  [1192, 292, 56],
];

export function HeroArt() {
  const ground = 346;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMaxYMax slice"
      className="absolute inset-0 size-full dark:brightness-[.62]"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd5e0" />
          <stop offset="1" stopColor="#f7e8cf" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky)" />
      <circle cx="930" cy="128" r="58" fill="#f6c76f" />
      <path d="M0 262 C200 196 360 250 560 214 S920 170 1200 236 V420 H0Z" fill="#8fb0a4" />
      <path d="M0 300 C240 250 460 306 720 262 S1040 252 1200 288 V420 H0Z" fill="#6c9180" />
      <path d="M0 340 C300 322 760 330 1200 336 V420 H0Z" fill="#4f7560" />
      {trees.map(([x, y, h]) => (
        <g key={x}>
          <rect x={x - 3} y={y + h - 6} width="6" height="28" fill="#4a3b30" />
          <path d={`M${x} ${y - h / 2}L${x + h / 2.4} ${y + h}H${x - h / 2.4}Z`} fill="#2f5546" />
        </g>
      ))}
      {houses.map((house) => {
        const top = ground - house.h;
        const peak = top - house.h * 0.52;
        const center = house.x + house.w / 2;
        return (
          <g key={house.x}>
            <rect x={house.x} y={top} width={house.w} height={house.h} fill={house.wall} />
            <path
              d={`M${house.x - 8} ${top + 2}L${center} ${peak}L${house.x + house.w + 8} ${top + 2}Z`}
              fill={house.roof}
            />
            <rect x={center - 11} y={ground - 40} width="22" height="40" fill="#fbf7ef" />
            <rect x={house.x + 13} y={top + 15} width="20" height="22" fill="#fbf7ef" />
            <rect x={house.x + house.w - 33} y={top + 15} width="20" height="22" fill="#fbf7ef" />
            <rect x={house.x + 15.5} y={top + 17.5} width="15" height="17" fill="#49606b" />
            <rect x={house.x + house.w - 30.5} y={top + 17.5} width="15" height="17" fill="#49606b" />
          </g>
        );
      })}
      <path d="M0 362 C340 344 840 352 1200 356 V420 H0Z" fill="#dcd2bf" />
      <path d="M0 386 C340 372 840 378 1200 382 V420 H0Z" fill="#40614f" />
    </svg>
  );
}

const coverBackgrounds: Record<CoverKind, string> = {
  sommar: "#f2c879",
  lekplats: "#a8cbd6",
  stamma: "#d9c6b0",
  vag: "#c6d6dd",
};

export function CoverArt({ kind, className = "" }: { kind: CoverKind; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={`block size-full dark:brightness-75 ${className}`}
    >
      <rect width="400" height="240" fill={coverBackgrounds[kind]} />
      {kind === "sommar" && (
        <>
          <circle cx="310" cy="66" r="36" fill="#fff0c4" />
          <path d="M0 58 Q200 128 400 44" fill="none" stroke="#6a4b2e" strokeWidth="2" />
          {[40, 100, 160, 220, 280, 340].map((x, index) => (
            <path key={x} d={`M${x - 15} ${72 + (index % 3) * 8}h30l-15 30z`} fill={["#b5432f", "#1f4b63", "#fbf7ef"][index % 3]} />
          ))}
          <path d="M0 196 Q200 160 400 192 V240 H0Z" fill="#6c9180" />
        </>
      )}
      {kind === "lekplats" && (
        <>
          <path d="M0 200 Q200 176 400 200 V240 H0Z" fill="#6c9180" />
          <path d="M116 204 L156 68 H264 L304 204 M156 68 L176 204 M264 68 L244 204" fill="none" stroke="#7a3f28" strokeWidth="8" strokeLinecap="round" />
          <path d="M192 72 V156 M226 72 V156" stroke="#31424c" strokeWidth="3" />
          <rect x="184" y="154" width="50" height="9" rx="3" fill="#b5432f" />
        </>
      )}
      {kind === "stamma" && (
        <>
          <rect x="128" y="36" width="144" height="176" rx="5" fill="#fbf7ef" />
          <path d="M152 76h96M152 104h96M152 132h96M152 160h58" stroke="#8c8171" strokeWidth="7" strokeLinecap="round" />
          <circle cx="282" cy="186" r="30" fill="#1f4b63" />
          <path d="M268 186l10 11 19-22" fill="none" stroke="#fbf7ef" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === "vag" && (
        <>
          <path d="M0 130 Q200 92 400 130 V240 H0Z" fill="#eef2f1" />
          <path d="M160 240 L192 108 H208 L240 240Z" fill="#7d8b91" />
          <path d="M200 116 V144 M200 162 V196 M200 212 V240" stroke="#fbf7ef" strokeWidth="4" />
          <path d="M72 138 l24 -66 24 66z M304 136 l20 -54 20 54z" fill="#2f5546" />
        </>
      )}
    </svg>
  );
}

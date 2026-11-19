import { useEffect, useRef, useState } from "react";
import { formatKr, formatKrShort, type PlanYear } from "../lib/maintenance";

const HEIGHT = 260;
const MARGIN = { top: 16, right: 48, bottom: 28, left: 56 };

function niceStep(range: number, count: number) {
  const raw = range / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= raw) ?? 10;
  return step * power;
}

function barPath(x: number, top: number, bottom: number, width: number) {
  const radius = Math.min(4, width / 2, bottom - top);
  const left = x - width / 2;
  const right = x + width / 2;
  return `M${left} ${bottom}V${top + radius}Q${left} ${top} ${left + radius} ${top}H${right - radius}Q${right} ${top} ${right} ${top + radius}V${bottom}Z`;
}

export function MaintenanceChart({ plan }: { plan: PlanYear[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const values = [0, ...plan.flatMap((year) => [year.cost, year.balance])];
  const step = niceStep(Math.max(...values) - Math.min(...values) || 1, 4);
  const min = Math.floor(Math.min(...values) / step) * step;
  const max = Math.ceil(Math.max(...values) / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step);

  const innerWidth = Math.max(1, width - MARGIN.left - MARGIN.right);
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const band = innerWidth / plan.length;
  const barWidth = Math.max(3, Math.min(24, band * 0.6));
  const x = (index: number) => MARGIN.left + band * index + band / 2;
  const y = (value: number) => MARGIN.top + innerHeight * (1 - (value - min) / (max - min || 1));
  // Year labels need about 40px each, so narrow screens label every 2nd, 5th or 10th year.
  const labelEvery = [1, 2, 5, 10].find((every) => every * band >= 40) ?? 10;
  const linePath = plan.map((year, index) => `${index ? "L" : "M"}${x(index)} ${y(year.balance)}`).join("");
  const last = plan.length - 1;
  const current = active === null ? null : plan[active];

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted" aria-label="Förklaring">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-chart-cost" /> Kostnad per år
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded bg-chart-fund" /> Fondens saldo vid årets slut
        </li>
      </ul>
      <div ref={ref} className="relative w-full min-w-0" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Kostnad per år och fondens saldo. Siffrorna finns i tabellen under diagrammet." className="block h-[260px] w-full">
          {min < 0 && (
            <rect x={MARGIN.left} y={y(0)} width={innerWidth} height={y(min) - y(0)} className="fill-danger-soft" />
          )}
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? "stroke-muted" : "stroke-line"} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="central" className="fill-muted text-[11px] tabular-nums">
                {formatKrShort(tick)}
              </text>
            </g>
          ))}
          {plan.map((year, index) => (
            <g key={year.year}>
              {year.cost > 0 && (
                <path d={barPath(x(index), y(year.cost), y(0), barWidth)} className={`fill-chart-cost ${active !== null && active !== index ? "opacity-40" : ""}`} />
              )}
              {(index % labelEvery === 0 || index === last) && (
                <text x={x(index)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">
                  {year.year}
                </text>
              )}
            </g>
          ))}
          <path d={linePath} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-chart-fund" />
          <text x={x(last) + 8} y={y(plan[last].balance)} dominantBaseline="central" className="fill-muted text-[11px]">
            Fond
          </text>
          {current && active !== null && (
            <>
              <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + innerHeight} className="stroke-muted" strokeDasharray="3 3" />
              <circle cx={x(active)} cy={y(current.balance)} r={5} strokeWidth={2} className="fill-chart-fund stroke-surface" />
            </>
          )}
          {plan.map((year, index) => (
            <rect
              key={year.year}
              x={MARGIN.left + band * index}
              y={MARGIN.top}
              width={band}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
              onClick={() => setActive(index)}
            />
          ))}
        </svg>
        {current && active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-56 rounded-xl border border-line bg-surface p-3 text-sm shadow-lg"
            style={{ left: Math.min(Math.max(x(active) > width / 2 ? x(active) - 236 : x(active) + 12, 0), width - 224) }}
          >
            <p className="font-semibold">{current.year}</p>
            <p className="mt-1 flex justify-between gap-2 tabular-nums">
              <span className="text-muted">Kostnad</span> {formatKr(current.cost)}
            </p>
            <p className="flex justify-between gap-2 tabular-nums">
              <span className="text-muted">Fond efter året</span>
              <span className={current.balance < 0 ? "font-semibold text-danger" : ""}>{formatKr(current.balance)}</span>
            </p>
            {current.items.length > 0 && (
              <ul className="mt-2 space-y-0.5 border-t border-line pt-2 text-muted">
                {current.items.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

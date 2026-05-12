"use client";

import { useMemo } from "react";

export function Donut({
  segments = [],
  size = 180,
  thickness = 18,
  centerLabel,
  centerValue,
}) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const slices = useMemo(() => {
    if (total <= 0) return [];
    let offset = 0;
    return segments.map((s, i) => {
      const fraction = s.value / total;
      const len = fraction * circumference;
      const slice = {
        ...s,
        i,
        dasharray: `${len} ${circumference - len}`,
        dashoffset: -offset,
      };
      offset += len;
      return slice;
    });
  }, [segments, total, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label="رسم بياني دائري"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.06)"
          strokeWidth={thickness}
        />
        {slices.map((s) => (
          <circle
            key={s.i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {centerLabel}
        </span>
        <span className="text-2xl font-extrabold text-slate-900 tabular">
          {centerValue ?? total}
        </span>
      </div>
    </div>
  );
}

export function DonutLegend({ segments }) {
  return (
    <ul className="space-y-2 text-sm">
      {segments.map((s, i) => (
        <li key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate-600 truncate">{s.label}</span>
          </div>
          <span className="font-bold text-slate-800 tabular">{s.value}</span>
        </li>
      ))}
    </ul>
  );
}

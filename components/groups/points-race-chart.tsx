"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LineChart, Table2 } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { BallLoader } from "@/components/ui/BallLoader";
import { getSessionCached, setSessionCached } from "@/lib/session-cache";

interface PointsHistoryMember { userId: string; name: string; avatarUrl: string | null }
interface PointsHistoryRow { date: string; values: Record<string, number> }
interface PointsHistory { members: PointsHistoryMember[]; rows: PointsHistoryRow[]; hasHistory: boolean }

// Validated dark-mode categorical 8 (see dataviz skill's palette.md) — run
// through scripts/validate_palette.js --mode dark before use: PASS on
// lightness/chroma/contrast, WARN (floor band) on adjacent CVD separation,
// which is why every line also gets a direct end-label and a legend swatch
// rather than relying on hue alone.
const SERIES_COLORS = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
] as const;
const OVERFLOW_COLOR = "rgba(255,255,255,0.3)"; // 9th+ member — identity carried by legend/tooltip text only

const CHART_W = 800;
const CHART_H = 320;
const PAD = { top: 16, right: 96, bottom: 30, left: 40 };

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  const candidates = [1, 2, 5, 10].map(m => m * step);
  return candidates.find(c => c >= value * 1.1) ?? candidates[candidates.length - 1] * 2;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function PointsRaceChart({ groupId }: { groupId: string }) {
  const { t } = useLocale();
  const [data, setData] = useState<PointsHistory | null | undefined>(undefined); // undefined = loading
  const [showTable, setShowTable] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cacheKey = `points-race:${groupId}`;
    const cached = getSessionCached<PointsHistory>(cacheKey);
    if (cached !== undefined) { setData(cached); return; }

    let cancelled = false;
    fetch(`/api/groups/${groupId}/points-history`)
      .then(r => r.json())
      .then((d: PointsHistory) => {
        if (cancelled) return;
        setData(d);
        setSessionCached(cacheKey, d);
      })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [groupId]);

  const colorFor = useCallback((idx: number) => idx < SERIES_COLORS.length ? SERIES_COLORS[idx] : OVERFLOW_COLOR, []);

  const geometry = useMemo(() => {
    if (!data || data.rows.length === 0) return null;
    const plotW = CHART_W - PAD.left - PAD.right;
    const plotH = CHART_H - PAD.top - PAD.bottom;
    const n = data.rows.length;
    const maxVal = niceMax(Math.max(1, ...data.rows.flatMap(r => Object.values(r.values))));

    const xAt = (i: number) => PAD.left + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));
    const yAt = (v: number) => PAD.top + plotH - (plotH * v) / maxVal;

    const lines = data.members.map((m, idx) => ({
      member: m,
      color:  colorFor(idx),
      points: data.rows.map((r, i) => ({ x: xAt(i), y: yAt(r.values[m.userId] ?? 0), v: r.values[m.userId] ?? 0 })),
    }));

    // Direct end-labels: start at each line's final Y, then push apart
    // (sorted top-to-bottom) so converging lines don't produce overlapping
    // text — per the "when end-labels collide, nudge apart" guidance.
    const MIN_GAP = 14;
    const endLabels = lines
      .map(l => ({ member: l.member, color: l.color, y: l.points[l.points.length - 1]?.y ?? 0, value: l.points[l.points.length - 1]?.v ?? 0 }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < endLabels.length; i++) {
      if (endLabels[i].y - endLabels[i - 1].y < MIN_GAP) {
        endLabels[i].y = endLabels[i - 1].y + MIN_GAP;
      }
    }

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: Math.round(maxVal * f), y: yAt(maxVal * f) }));

    return { plotW, plotH, maxVal, xAt, yAt, lines, endLabels, yTicks };
  }, [data, colorFor]);

  const handleMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!geometry || !data || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const n = data.rows.length;
    if (n === 0) return;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(geometry.xAt(i) - px);
      if (d < best) { best = d; nearest = i; }
    }
    setHoverIdx(nearest);
  }, [geometry, data]);

  if (data === undefined) {
    return (
      <div className="rounded-2xl px-5 py-8 flex justify-center" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <BallLoader size="sm" label={null} />
      </div>
    );
  }
  if (!data || data.members.length === 0) return null;

  const hoverRow = hoverIdx !== null ? data.rows[hoverIdx] : null;

  return (
    <div className="rounded-2xl px-5 py-4 space-y-3" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChart size={16} style={{ color: "#00D4FF" }} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>{t("points_race_heading")}</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{t("points_race_tagline")}</div>
          </div>
        </div>
        {data.hasHistory && (
          <button
            type="button"
            onClick={() => setShowTable(s => !s)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
          >
            <Table2 size={12} /> {showTable ? t("points_race_view_chart") : t("points_race_view_table")}
          </button>
        )}
      </div>

      {!data.hasHistory && (
        <div className="text-center py-6 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          {t("points_race_sparse")}
        </div>
      )}

      {data.hasHistory && !showTable && geometry && (
        <div className="relative w-full" style={{ aspectRatio: `${CHART_W} / ${CHART_H}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-full"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIdx(null)}
          >
            {/* Gridlines + Y ticks */}
            {geometry.yTicks.map(tick => (
              <g key={tick.v}>
                <line x1={PAD.left} x2={CHART_W - PAD.right} y1={tick.y} y2={tick.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={PAD.left - 8} y={tick.y + 3} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.35)">{tick.v}</text>
              </g>
            ))}

            {/* X date labels — sparse: first, last, and hover */}
            {[0, data.rows.length - 1].map(i => (
              <text key={i} x={geometry.xAt(i)} y={CHART_H - 8} textAnchor={i === 0 ? "start" : "end"} fontSize={10} fill="rgba(255,255,255,0.35)">
                {formatDate(data.rows[i].date)}
              </text>
            ))}

            {/* Crosshair */}
            {hoverIdx !== null && (
              <line x1={geometry.xAt(hoverIdx)} x2={geometry.xAt(hoverIdx)} y1={PAD.top} y2={CHART_H - PAD.bottom} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            )}

            {/* Lines */}
            {geometry.lines.map(l => (
              <polyline
                key={l.member.userId}
                points={l.points.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={l.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* End dots + direct labels */}
            {geometry.endLabels.map(l => (
              <g key={l.member.userId}>
                <circle cx={CHART_W - PAD.right} cy={l.y} r={4} fill={l.color} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
                <text x={CHART_W - PAD.right + 8} y={l.y + 3} fontSize={11} fontWeight={700} fill="rgba(255,255,255,0.85)">
                  {l.member.name.length > 12 ? `${l.member.name.slice(0, 11)}…` : l.member.name}
                </text>
              </g>
            ))}

            {/* Hover dots on the crosshair */}
            {hoverIdx !== null && geometry.lines.map(l => (
              <circle key={l.member.userId} cx={geometry.xAt(hoverIdx)} cy={l.points[hoverIdx].y} r={4} fill={l.color} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
            ))}
          </svg>

          {hoverRow && (
            <div
              className="absolute top-2 pointer-events-none rounded-xl px-3 py-2 text-xs"
              style={
                geometry.xAt(hoverIdx!) / CHART_W > 0.5
                  ? { right: `${Math.max(2, 100 - (geometry.xAt(hoverIdx!) / CHART_W) * 100)}%`, background: "rgba(10,10,20,0.92)", border: "1px solid rgba(255,255,255,0.15)", minWidth: 130 }
                  : { left: `${Math.max(2, (geometry.xAt(hoverIdx!) / CHART_W) * 100)}%`, background: "rgba(10,10,20,0.92)", border: "1px solid rgba(255,255,255,0.15)", minWidth: 130 }
              }
            >
              <div className="font-bold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{formatDate(hoverRow.date)}</div>
              {[...data.members]
                .map((m, idx) => ({ m, idx, v: hoverRow.values[m.userId] ?? 0 }))
                .sort((a, b) => b.v - a.v)
                .map(({ m, idx, v }) => (
                  <div key={m.userId} className="flex items-center gap-1.5 py-0.5">
                    <span style={{ width: 10, height: 2, background: colorFor(idx), display: "inline-block", borderRadius: 1 }} />
                    <span style={{ color: "rgba(255,255,255,0.55)" }} className="truncate max-w-[70px]">{m.name}</span>
                    <span className="font-black ml-auto" style={{ color: "#fff" }}>{v}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {data.hasHistory && showTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-3" style={{ color: "rgba(255,255,255,0.4)" }}>{t("points_race_date")}</th>
                {data.members.map((m, idx) => (
                  <th key={m.userId} className="text-right py-1.5 px-2 font-bold" style={{ color: colorFor(idx) }}>{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map(row => (
                <tr key={row.date} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td className="py-1.5 pr-3" style={{ color: "rgba(255,255,255,0.55)" }}>{formatDate(row.date)}</td>
                  {data.members.map(m => (
                    <td key={m.userId} className="text-right py-1.5 px-2 font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{row.values[m.userId] ?? 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend — the dependable identity channel for 2+ series; direct
          end-labels above supplement it, they don't replace it. */}
      {data.hasHistory && !showTable && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {data.members.map((m, idx) => (
            <div key={m.userId} className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 2, background: colorFor(idx), display: "inline-block", borderRadius: 1 }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{m.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

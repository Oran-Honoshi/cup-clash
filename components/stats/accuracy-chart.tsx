"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LineChart } from "lucide-react";
import { BallLoader } from "@/components/ui/BallLoader";

interface AccuracyPoint { date: string; accuracyPct: number; settledCount: number }
interface PersonalAccuracyHistory { points: AccuracyPoint[]; hasHistory: boolean; overallAccuracyPct: number }

// Single-series adaptation of PointsRaceChart's SVG line-chart machinery
// (components/groups/points-race-chart.tsx) — same scale/crosshair/end-label
// approach, trimmed to one line since this is personal (not per-member).
const LINE_COLOR = "#35D0A5"; // Statistician zone accent
const CHART_W = 800;
const CHART_H = 260;
const PAD = { top: 16, right: 56, bottom: 30, left: 36 };

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function AccuracyChart() {
  const [data, setData] = useState<PersonalAccuracyHistory | null | undefined>(undefined);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/accuracy-history")
      .then(r => r.json())
      .then((d: PersonalAccuracyHistory) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, []);

  const geometry = useMemo(() => {
    if (!data || data.points.length === 0) return null;
    const plotW = CHART_W - PAD.left - PAD.right;
    const plotH = CHART_H - PAD.top - PAD.bottom;
    const n = data.points.length;

    const xAt = (i: number) => PAD.left + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));
    const yAt = (v: number) => PAD.top + plotH - (plotH * v) / 100;

    const points = data.points.map((p, i) => ({ x: xAt(i), y: yAt(p.accuracyPct), v: p.accuracyPct }));
    const yTicks = [0, 25, 50, 75, 100].map(v => ({ v, y: yAt(v) }));

    return { plotW, plotH, xAt, yAt, points, yTicks };
  }, [data]);

  const handleMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!geometry || !data || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const n = data.points.length;
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
      <div className="rounded-2xl px-5 py-8 flex justify-center" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
        <BallLoader size="sm" label={null} />
      </div>
    );
  }

  if (!data || data.points.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm" style={{ background: "var(--sf)", border: "1px solid var(--br)", color: "var(--t2)" }}>
        No settled predictions yet — make some picks and check back once matches finish.
      </div>
    );
  }

  const hoverPoint = hoverIdx !== null ? data.points[hoverIdx] : null;

  return (
    <div className="rounded-2xl px-5 py-4 space-y-3" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChart size={16} style={{ color: LINE_COLOR }} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LINE_COLOR }}>Accuracy Over Time</div>
            <div className="text-[11px]" style={{ color: "var(--t2)" }}>Cumulative, across every group you're in</div>
          </div>
        </div>
        <div className="text-lg font-black" style={{ color: "var(--tx)" }}>{data.overallAccuracyPct}%</div>
      </div>

      {!data.hasHistory ? (
        <div className="text-center py-6 text-sm" style={{ color: "var(--t2)" }}>
          Only one day of data so far — the line will fill in as more matches settle.
        </div>
      ) : geometry && (
        <div className="relative w-full" style={{ aspectRatio: `${CHART_W} / ${CHART_H}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-full"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIdx(null)}
          >
            {geometry.yTicks.map(tick => (
              <g key={tick.v}>
                <line x1={PAD.left} x2={CHART_W - PAD.right} y1={tick.y} y2={tick.y} stroke="var(--br)" strokeWidth={1} />
                <text x={PAD.left - 8} y={tick.y + 3} textAnchor="end" fontSize={10} fill="var(--t2)">{tick.v}%</text>
              </g>
            ))}

            {[0, data.points.length - 1].map(i => (
              <text key={i} x={geometry.xAt(i)} y={CHART_H - 8} textAnchor={i === 0 ? "start" : "end"} fontSize={10} fill="var(--t2)">
                {formatDate(data.points[i].date)}
              </text>
            ))}

            {hoverIdx !== null && (
              <line x1={geometry.xAt(hoverIdx)} x2={geometry.xAt(hoverIdx)} y1={PAD.top} y2={CHART_H - PAD.bottom} stroke="var(--br)" strokeWidth={1} />
            )}

            <polyline
              points={geometry.points.map(p => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={LINE_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {(() => {
              const last = geometry.points[geometry.points.length - 1];
              return (
                <g>
                  <circle cx={last.x} cy={last.y} r={4} fill={LINE_COLOR} stroke="var(--sf)" strokeWidth={2} />
                  <text x={CHART_W - PAD.right + 8} y={last.y + 3} fontSize={11} fontWeight={700} fill="var(--tx)">{last.v}%</text>
                </g>
              );
            })()}

            {hoverIdx !== null && (
              <circle cx={geometry.xAt(hoverIdx)} cy={geometry.points[hoverIdx].y} r={4} fill={LINE_COLOR} stroke="var(--sf)" strokeWidth={2} />
            )}
          </svg>

          {hoverPoint && (
            <div
              className="absolute top-2 pointer-events-none rounded-xl px-3 py-2 text-xs"
              style={
                geometry.xAt(hoverIdx!) / CHART_W > 0.5
                  ? { right: `${Math.max(2, 100 - (geometry.xAt(hoverIdx!) / CHART_W) * 100)}%`, background: "var(--ip)", border: "1px solid var(--br)", minWidth: 120 }
                  : { left: `${Math.max(2, (geometry.xAt(hoverIdx!) / CHART_W) * 100)}%`, background: "var(--ip)", border: "1px solid var(--br)", minWidth: 120 }
              }
            >
              <div className="font-bold mb-1" style={{ color: "var(--tx)" }}>{formatDate(hoverPoint.date)}</div>
              <div style={{ color: "var(--t2)" }}>{hoverPoint.accuracyPct}% accuracy</div>
              <div style={{ color: "var(--t2)" }}>{hoverPoint.settledCount} settled picks</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

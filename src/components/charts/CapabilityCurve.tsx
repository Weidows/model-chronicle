import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import type { OrgMeta, Release } from '../../data/types'
import { fmtDate, yearFraction } from '../../lib/format'
import { rankMetrics } from '../../lib/metrics'
import { familyTone } from '../../lib/tone'
import { cn } from '../../lib/utils'

const W = 1000
const H = 320
const PAD = { l: 44, r: 26, t: 28, b: 40 }
/** How many same-benchmark series the chip row offers. */
const MAX_CHIPS = 4

const labOf = (r: Release) => r.org ?? r.repo.split('/')[0]

/**
 * Cross-generation capability curve. No composite score is invented: the panel
 * plots one benchmark at a time, picked by how many labs report it (so it spans
 * labs whenever the cards allow) and switchable between the top comparable
 * metrics. Card spellings are canonicalised, otherwise one lab's "GPQA-Diamond"
 * and another's "GPQA Diamond" would read as two different benchmarks.
 */
export function CapabilityCurve({ releases, orgs }: { releases: Release[]; orgs?: OrgMeta[] }) {
  const reduce = useReducedMotion()
  const ranked = useMemo(() => rankMetrics(releases), [releases])
  const [picked, setPicked] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  const series = ranked.find((s) => s.key === picked) ?? ranked[0]

  const labMeta = (id: string) => orgs?.find((o) => o.id === id)
  const colorOf = (r: Release) => {
    const o = labMeta(labOf(r))
    return o ? `hsl(${o.hue} 85% 66%)` : familyTone[r.family].hex
  }
  const labLabel = (id: string) => labMeta(id)?.short ?? id

  if (!series) {
    return <p className="text-xs text-fog/60">可比跨代测评样本不足，暂不绘制曲线。</p>
  }

  const pts = series.points
  const xs = pts.map((p) => yearFraction(p.release.date))
  const ys = pts.map((p) => p.score)
  const yearTicks = Array.from(
    { length: Math.max(0, Math.floor(Math.max(...xs)) - Math.ceil(Math.min(...xs)) + 1) },
    (_, i) => Math.ceil(Math.min(...xs)) + i,
  )
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const yLo = Math.min(...ys)
  const yHi = Math.max(...ys)
  const yPad = (yHi - yLo) * 0.18 || 1

  const px = (v: number) => PAD.l + ((v - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r)
  const py = (v: number) =>
    H - PAD.b - ((v - (yLo - yPad)) / (yHi + yPad - (yLo - yPad))) * (H - PAD.t - PAD.b)

  const line = pts.map((_, i) => `${i === 0 ? 'M' : 'L'}${px(xs[i]).toFixed(1)},${py(ys[i]).toFixed(1)}`).join(' ')
  const area = `${line} L${px(x1).toFixed(1)},${H - PAD.b} L${px(x0).toFixed(1)},${H - PAD.b} Z`

  const first = pts[0]
  const last = pts[pts.length - 1]
  const gain = (last.score - first.score).toFixed(1)
  const hovered = pts.find((p) => p.release.id === hover) ?? null

  return (
    <div className="flex flex-col gap-3">
      {ranked.length > 1 ? (
        <div className="no-bar flex items-center gap-1.5 overflow-x-auto">
          <span className="label-hud shrink-0">同为多家所报</span>
          {ranked.slice(0, MAX_CHIPS).map((s) => {
            const on = s.key === series.key
            return (
              <button
                key={s.key}
                onClick={() => setPicked(s.key)}
                title={`${s.label}：${s.labs.length} 家厂商 · ${s.points.length} 个版本可比`}
                aria-pressed={on}
                className={cn(
                  'shrink-0 rounded-sm border px-2 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap transition',
                  on ? 'border-cyan/45 bg-cyan/12 text-cyan' : 'border-edge text-fog/60 hover:text-fog',
                )}
              >
                {s.label}
                <span className="ml-1 text-fog/50">
                  {s.labs.length}家·{s.points.length}点
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${series.label} 跨代趋势`}>
        <defs>
          <linearGradient id="cap-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38e2ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38e2ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yPos = PAD.t + t * (H - PAD.t - PAD.b)
          const val = yHi + yPad - t * (yHi + yPad - (yLo - yPad))
          return (
            <g key={t}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yPos}
                y2={yPos}
                stroke="#1c2a44"
                strokeWidth="1"
                strokeDasharray={t === 1 ? undefined : '2 6'}
              />
              <text x={PAD.l - 8} y={yPos + 3.5} textAnchor="end" className="fill-fog/50 font-mono text-[10px]">
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}

        {yearTicks.map((y) => (
          <g key={y}>
            <line
              x1={px(yearFraction(`${y}-01-01`))}
              x2={px(yearFraction(`${y}-01-01`))}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="#1c2a44"
              strokeWidth="1"
              strokeDasharray="1 7"
            />
            <text x={px(yearFraction(`${y}-01-01`)) + 5} y={PAD.t + 11} className="fill-fog/45 font-mono text-[10px]">
              {y}
            </text>
          </g>
        ))}

        <motion.path
          key={`area-${series.key}`}
          d={area}
          fill="url(#cap-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0 : 1.2, delay: 0.5 }}
        />
        <motion.path
          key={`line-${series.key}`}
          d={line}
          fill="none"
          stroke="#38e2ff"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {pts.map((p, i) => (
          <g key={p.release.id}>
            <motion.circle
              cx={px(xs[i])}
              cy={py(ys[i])}
              r={hover === p.release.id ? 7 : 4}
              fill="#04060b"
              stroke={colorOf(p.release)}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.6 + (i % 10) * 0.05 }}
              onMouseEnter={() => setHover(p.release.id)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer transition-[r]"
            />
            {(i === 0 || i === pts.length - 1 || hover === p.release.id) && (
              <text
                x={px(xs[i])}
                y={py(ys[i]) - 13}
                textAnchor="middle"
                className="fill-fog font-mono text-[11px]"
              >
                {ys[i]}
              </text>
            )}
          </g>
        ))}

        {[first, last].map((p, i) => (
          <text
            key={p.release.id}
            x={px(xs[i === 0 ? 0 : xs.length - 1])}
            y={H - 12}
            textAnchor={i === 0 ? 'start' : 'end'}
            className="fill-fog/70 font-mono text-[11px]"
          >
            {fmtDate(p.release.date).slice(0, 7)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-edge/40 pt-3">
        <p className="text-[11px] leading-relaxed text-fog/75">
          <span className="text-snow">{series.label}</span>
          <span className="px-1.5 text-fog/50">·</span>
          {pts.length} 个版本可比
          <span className="px-1.5 text-fog/50">·</span>
          跨 {series.labs.length} 家
          <span className="px-1.5 text-fog/50">·</span>
          {hovered ? (
            <>
              <span style={{ color: colorOf(hovered.release) }}>{hovered.release.name}</span> {hovered.score}
              {hovered.note ? <span className="text-fog/60">（{hovered.note}）</span> : null}
            </>
          ) : (
            <>
              {first.release.name} {first.score} → {last.release.name} {last.score}
              <span className="px-1.5 text-fog/50">·</span>
              提升 {gain}
              {series.unit === '%' ? ' 个点' : ''}
            </>
          )}
        </p>
        <span className="font-mono text-[10px] text-fog/50">
          {series.unit === '%' ? 'SCORE / 100' : `UNIT ${series.unit.toUpperCase()}`}
        </span>
      </div>

      {orgs && orgs.length > 1 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {series.labs.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-fog/60">
              <span
                className="size-1.5 rounded-full"
                style={{ background: `hsl(${labMeta(id)?.hue ?? 190} 85% 66%)` }}
              />
              {labLabel(id)}
            </span>
          ))}
          {series.variantsFolded ? (
            <span className="font-mono text-[10px] text-fog/45">
              其中 {series.variantsFolded} 个版本有多个评测口径，取最高分
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

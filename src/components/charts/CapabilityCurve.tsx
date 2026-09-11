import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import type { Release } from '../../data/types'
import { fmtDate, yearFraction } from '../../lib/format'
import { familyTone } from '../../lib/tone'

const W = 1000
const H = 320
const PAD = { l: 44, r: 26, t: 28, b: 40 }

/**
 * Cross-generation capability curve. Rather than inventing a composite score
 * we plot whichever single benchmark the most model cards actually report.
 */
export function CapabilityCurve({ releases }: { releases: Release[] }) {
  const [hover, setHover] = useState<Release | null>(null)
  const reduce = useReducedMotion()

  const series = useMemo(() => {
    const byMetric = new Map<string, Release[]>()
    for (const r of releases) {
      if (!r.headline) continue
      const list = byMetric.get(r.headline.metric) ?? []
      list.push(r)
      byMetric.set(r.headline.metric, list)
    }
    let best: { metric: string; pts: Release[] } | null = null
    for (const [metric, pts] of byMetric) {
      const sorted = [...pts].sort((a, b) => a.date.localeCompare(b.date))
      if (!best || sorted.length > best.pts.length) best = { metric, pts: sorted }
    }
    return best
  }, [releases])

  if (!series || series.pts.length < 3) {
    return <p className="text-xs text-fog/60">可比跨代测评样本不足，暂不绘制曲线。</p>
  }

  const xs = series.pts.map((r) => yearFraction(r.date))
  const ys = series.pts.map((r) => r.headline!.score)
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

  const line = series.pts
    .map((_, i) => `${i === 0 ? 'M' : 'L'}${px(xs[i]).toFixed(1)},${py(ys[i]).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${px(x1).toFixed(1)},${H - PAD.b} L${px(x0).toFixed(1)},${H - PAD.b} Z`

  const first = series.pts[0]
  const last = series.pts[series.pts.length - 1]
  const gain = (last.headline!.score - first.headline!.score).toFixed(1)

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${series.metric} 跨代趋势`}>
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
              <text
                x={PAD.l - 8}
                y={yPos + 3.5}
                textAnchor="end"
                className="fill-fog/50 font-mono text-[10px]"
              >
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
            <text
              x={px(yearFraction(`${y}-01-01`)) + 5}
              y={PAD.t + 11}
              className="fill-fog/45 font-mono text-[10px]"
            >
              {y}
            </text>
          </g>
        ))}

        <motion.path
          d={area}
          fill="url(#cap-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0 : 1.2, delay: 0.5 }}
        />
        <motion.path
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

        {series.pts.map((r, i) => (
          <g key={r.id}>
            <motion.circle
              cx={px(xs[i])}
              cy={py(ys[i])}
              r={hover?.id === r.id ? 7 : 4}
              fill="#04060b"
              stroke={familyTone[r.family].hex}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.6 + i * 0.06 }}
              onMouseEnter={() => setHover(r)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer transition-[r]"
            />
            {(i === 0 || i === series.pts.length - 1 || hover?.id === r.id) && (
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

        {[first, last].map((r, i) => (
          <text
            key={r.id}
            x={px(xs[i === 0 ? 0 : xs.length - 1])}
            y={H - 12}
            textAnchor={i === 0 ? 'start' : 'end'}
            className="fill-fog/70 font-mono text-[11px]"
          >
            {fmtDate(r.date).slice(0, 7)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-edge/40 pt-3">
        <p className="text-[11px] leading-relaxed text-fog/75">
          <span className="text-snow">{series.metric}</span>
          <span className="px-1.5 text-fog/50">·</span>
          {series.pts.length} 个版本可比
          <span className="px-1.5 text-fog/50">·</span>
          {hover ? (
            <>
              <span className="text-cyan">{hover.name}</span> {hover.headline!.score}
            </>
          ) : (
            <>
              {first.name} {first.headline!.score} → {last.name} {last.headline!.score}
              <span className="px-1.5 text-fog/50">·</span>
              提升 {gain} 分
            </>
          )}
        </p>
        <span className="font-mono text-[10px] text-fog/50">SCORE / 100</span>
      </div>
    </div>
  )
}

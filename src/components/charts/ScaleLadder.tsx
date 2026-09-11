import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import type { Release } from '../../data/types'
import { fmtDate, yearFraction } from '../../lib/format'
import { familyTone, tierTone } from '../../lib/tone'

const W = 1000
const H = 300
const PAD = { l: 48, r: 26, t: 26, b: 42 }
const TICKS = [1, 10, 100, 1000]

/**
 * Parameter ladder: total size on a log axis, with activated parameters drawn
 * inside the same stem. The gap between the two is the whole point of MoE,
 * so it is the visual subject rather than a footnote.
 */
export function ScaleLadder({ releases }: { releases: Release[] }) {
  const rows = releases.filter((r) => r.paramsB)
  const [hover, setHover] = useState<Release | null>(null)
  const reduce = useReducedMotion()

  if (rows.length < 3) return <p className="text-xs text-fog/60">参数量样本不足。</p>

  const xs = rows.map((r) => yearFraction(r.date))
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const lo = 1
  const hi = Math.max(...rows.map((r) => r.paramsB!)) * 1.6

  const px = (v: number) => PAD.l + ((v - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r)
  const py = (v: number) =>
    H - PAD.b - ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (H - PAD.t - PAD.b)

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="模型参数量随时间变化">
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py(t)} y2={py(t)} stroke="#1c2a44" strokeWidth="1" strokeDasharray="2 6" />
            <text x={PAD.l - 10} y={py(t) + 3} textAnchor="end" className="fill-fog/60 font-mono text-[10px]">
              {t >= 1000 ? `${t / 1000}T` : `${t}B`}
            </text>
          </g>
        ))}

        {rows.map((r, i) => {
          const color = familyTone[r.family].hex
          const active = hover?.id === r.id
          return (
            <g key={r.id} onMouseEnter={() => setHover(r)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
              <motion.line
                x1={px(xs[i])}
                x2={px(xs[i])}
                y1={H - PAD.b}
                y2={py(r.paramsB!)}
                stroke={color}
                strokeWidth={active ? 1.6 : 1}
                strokeOpacity={active ? 0.85 : 0.3}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : i * 0.02 }}
              />
              <motion.circle
                cx={px(xs[i])}
                cy={py(r.paramsB!)}
                r={tierTone[r.tier].size / 2.4}
                fill={color}
                fillOpacity={r.tier === 'minor' ? 0.5 : 0.9}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.3 + i * 0.03 }}
              />
              {r.activeB ? (
                <circle cx={px(xs[i])} cy={py(r.paramsB!)} r={tierTone[r.tier].size / 7} fill="#04060b" />
              ) : null}
              <rect
                x={px(xs[i]) - 7}
                y={PAD.t}
                width="14"
                height={H - PAD.t - PAD.b}
                fill="transparent"
              />
            </g>
          )
        })}

        {[2024, 2025, 2026].map((y) => (
          <text key={y} x={px(y)} y={H - 14} textAnchor="middle" className="fill-fog/70 font-mono text-[11px]">
            {y}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-edge/40 pt-3">
        <p className="text-[11px] leading-relaxed text-fog/75">
          {hover ? (
            <>
              <span className="text-snow">{hover.name}</span>
              <span className="px-1.5 text-fog/50">·</span>
              {fmtDate(hover.date)}
              <span className="px-1.5 text-fog/50">·</span>
              总参数 {hover.totalParams ?? '未标注'}
              <span className="px-1.5 text-fog/50">·</span>
              激活 {hover.activatedParams ?? '未标注'}
            </>
          ) : (
            <>
              实心点＝总参数量，中心缺口＝单次前向真正激活的参数。从 671B/37B 到 552B/8B，
              稀疏化把“模型很大”和“每次很贵”拆成了两件事。
            </>
          )}
        </p>
        <span className="font-mono text-[10px] text-fog/50">LOG PARAMS</span>
      </div>
    </div>
  )
}

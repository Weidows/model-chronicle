import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import type { Release } from '../../data/types'
import { fmtCompact, fmtDate } from '../../lib/format'
import { familyTone } from '../../lib/tone'
import { cn } from '../../lib/utils'

/**
 * Downloads per repo, in release order, log-scaled.
 * HF reports a rolling 30-day window, so the newest release always looks tiny:
 * that asymmetry is annotated instead of hidden.
 */
export function DownloadPulse({ releases }: { releases: Release[] }) {
  const rows = [...releases].sort((a, b) => a.date.localeCompare(b.date))
  const [hover, setHover] = useState<Release | null>(null)
  const reduce = useReducedMotion()

  const maxLog = Math.log10(Math.max(...rows.map((r) => r.downloads)) + 1)
  const peak = Math.max(...rows.map((r) => r.downloads))
  const top = [...rows].sort((a, b) => b.downloads - a.downloads).slice(0, 3).map((r) => r.id)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative flex h-[180px] items-end gap-[3px] pl-10"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="各版本近 30 天下载量（对数刻度）"
      >
        {/* y scale: log gridlines + labels + baseline */}
        {[1e4, 1e5, 1e6, 1e7].map((v) => {
          if (v > peak * 1.6) return null
          const pct = 4 + (Math.log10(v) / maxLog) * 92
          return (
            <div key={v} className="pointer-events-none absolute inset-x-0" style={{ bottom: `${pct}%` }}>
              <div className="h-px w-full bg-edge/35" />
              <span className="num absolute -top-3 right-[calc(100%-2.25rem)] text-[9px] text-fog/55">
                {fmtCompact(v)}
              </span>
            </div>
          )
        })}
        <span className="pointer-events-none absolute right-0 bottom-0 left-10 h-px bg-edge/70" />
        {rows.map((r, i) => {
          const pct = 4 + (Math.log10(r.downloads + 1) / maxLog) * 92
          const isTop = top.includes(r.id)
          const active = hover?.id === r.id
          return (
            <button
              key={r.id}
              type="button"
              onMouseEnter={() => setHover(r)}
              onFocus={() => setHover(r)}
              aria-label={`${r.name} ${fmtCompact(r.downloads)} downloads`}
              className="group relative flex h-full flex-1 cursor-default items-end"
            >
              <motion.span
                className={cn(
                  'block w-full rounded-t-[2px] transition-colors',
                  isTop ? familyTone[r.family].dot : 'bg-edge',
                  active && 'brightness-150',
                )}
                style={{ opacity: isTop ? 0.95 : 0.75 }}
                initial={{ height: 0 }}
                whileInView={{ height: `${pct}%` }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduce ? 0 : 0.9, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="pointer-events-none absolute -bottom-4 left-1/2 h-2 w-px -translate-x-1/2 bg-edge/60" />
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between px-10 font-mono text-[9px] text-fog/45">
        <span>{fmtDate(rows[0].date)}</span>
        <span>发布顺序 · {rows.length} 个节点</span>
        <span>{fmtDate(rows[rows.length - 1].date)}</span>
      </div>

      <div className="flex min-h-[52px] items-start justify-between gap-4 border-t border-edge/40 pt-3">
        <p className="max-w-[52ch] text-[11px] leading-relaxed text-fog/70">
          {hover ? (
            <>
              <span className="text-snow">{hover.name}</span>
              <span className="px-1.5 text-fog/50">·</span>
              {fmtDate(hover.date)}
              <span className="px-1.5 text-fog/50">·</span>
              近 30 天 {fmtCompact(hover.downloads)} 次下载
              <span className="px-1.5 text-fog/50">·</span>
              仓库体积 {hover.storageLabel ?? '未标注'}
            </>
          ) : (
            <>
              峰值 <span className="text-snow">{fmtCompact(peak)}</span> 次（{rows.find((r) => r.downloads === peak)?.name ?? '—'}）。
              数值为 Hugging Face 近 30 天滚动统计，刚发布的模型天然偏低。
            </>
          )}
        </p>
        <span className="flex shrink-0 items-center gap-3 font-mono text-[10px] text-fog/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[1px] bg-cyan" />
            下载前三
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[1px] bg-edge" />
            其余节点
          </span>
        </span>
      </div>
    </div>
  )
}

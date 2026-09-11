import { motion, useReducedMotion } from 'motion/react'

import type { Release } from '../../data/types'
import { fmtCompact, fmtDate } from '../../lib/format'
import { familyTone } from '../../lib/tone'
import { cn } from '../../lib/utils'

/** Ranked by total likes: the fairest cross-era popularity signal we have. */
export function LikesBoard({
  releases,
  limit = 12,
  onSelect,
}: {
  releases: Release[]
  limit?: number
  onSelect?: (r: Release) => void
}) {
  const rows = [...releases].sort((a, b) => b.likes - a.likes).slice(0, limit)
  const max = rows[0]?.likes ?? 1
  const reduce = useReducedMotion()

  return (
    <ol className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onSelect?.(r)}
            className="group grid w-full grid-cols-[1.9rem_1fr_auto] items-center gap-3 text-left"
          >
            <span className="font-mono text-[11px] text-fog/60">
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex items-baseline gap-2">
                <span className="truncate font-display text-[13px] tracking-wide text-snow transition-colors group-hover:text-cyan">
                  {r.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-fog/55">{fmtDate(r.date)}</span>
              </span>
              <span className="block h-[5px] w-full overflow-hidden rounded-full bg-edge/45">
                <motion.span
                  className={cn('block h-full rounded-full', familyTone[r.family].dot)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.max(1.5, (r.likes / max) * 100)}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduce ? 0 : 1, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </span>

            <span className="shrink-0 font-mono text-xs tabular-nums text-snow">
              {fmtCompact(r.likes)}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

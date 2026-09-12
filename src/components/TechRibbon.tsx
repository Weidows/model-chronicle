import { useMemo, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { motion, useReducedMotion } from 'motion/react'
import { Zap } from 'lucide-react'

import type { Breakthrough, Dataset } from '../data/types'
import { fmtDate, yearFraction } from '../lib/format'
import { cn, mapRange } from '../lib/utils'
import { Chip, HudLabel, SectionHeading } from './ui/primitives'

type Lane = Breakthrough['lane']
const LANES: Lane[] = ['架构', '训练', '推理', '多模态', '后训练']

const laneTone: Record<Lane, { text: string; hex: string; bg: string }> = {
  架构: { text: 'text-cyan', hex: '#38e2ff', bg: 'bg-cyan/10' },
  训练: { text: 'text-mint', hex: '#2fe6a8', bg: 'bg-mint/10' },
  推理: { text: 'text-amber', hex: '#ffb545', bg: 'bg-amber/10' },
  多模态: { text: 'text-rose', hex: '#ff5d73', bg: 'bg-rose/10' },
  后训练: { text: 'text-violet', hex: '#9270ff', bg: 'bg-violet/10' },
}

/** "关键技术突破" — one ribbon per technique, from introduction to today. */
export function TechRibbon({ data }: { data: Dataset }) {
  const [lane, setLane] = useState<Lane | 'all'>('all')
  const reduced = useReducedMotion()

  const { origin, span } = useMemo(() => {
    const dates = data.breakthroughs.map((b) => yearFraction(b.date))
    const o = Math.min(...dates) - 0.12
    return { origin: o, span: Math.max(...dates) - o + 0.28 }
  }, [data.breakthroughs])

  const rows = useMemo(
    () =>
      [...data.breakthroughs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((b) => lane === 'all' || b.lane === lane),
    [data.breakthroughs, lane],
  )

  return (
    <section id="tech" className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading
          index="02"
          kicker="breakthrough log"
          title={
            <>
              每一项突破，都在轴上留下
              <span className="text-amber"> 一道痕迹</span>
            </>
          }
          lede="横条代表这项技术从首次开源到今天的存续期。颜色代表它属于哪一层：架构、训练、推理、多模态还是后训练。"
        />

        <Tabs.Root value={lane} onValueChange={(v) => setLane(v as Lane | 'all')}>
          <Tabs.List className="flex flex-wrap gap-1.5">
            {(['all', ...LANES] as const).map((l) => (
              <Tabs.Trigger
                key={l}
                value={l}
                className={cn(
                  'rounded-sm border px-2.5 py-1 font-mono text-[10px] tracking-wider transition',
                  lane === l
                    ? 'border-cyan/45 bg-cyan/12 text-cyan'
                    : 'border-edge text-fog/60 hover:text-fog',
                )}
              >
                {l === 'all' ? '全部' : l}
                <span className="ml-1.5 text-fog/50">
                  {l === 'all'
                    ? data.breakthroughs.length
                    : data.breakthroughs.filter((b) => b.lane === l).length}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="mt-5 overflow-hidden rounded-sm border border-edge/60">
            {rows.map((b, i) => {
              const tone = laneTone[b.lane]
              const start = mapRange(yearFraction(b.date), origin, origin + span, 0, 100)
              const width = Math.max(4, 100 - start)
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.55, delay: Math.min(0.3, i * 0.03), ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-1 items-center gap-2 border-b border-edge/40 px-4 py-3 last:border-b-0 hover:bg-white/2 md:grid-cols-[7.5rem_5.5rem_1fr]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Zap className="size-3.5 shrink-0" style={{ color: tone.hex }} strokeWidth={2} />
                    <span
                      className={cn('truncate font-mono text-[11px] tracking-wider', tone.text)}
                      title={b.label}
                    >
                      {b.label}
                    </span>
                  </div>
                  <span className="num text-[10px] text-fog/70">{fmtDate(b.date)}</span>

                  <div className="relative flex items-center gap-3">
                    {/* gantt bar */}
                    <div className="relative hidden h-6 min-w-0 flex-1 sm:block">
                      <div
                        className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                        style={{
                          left: `${start}%`,
                          width: `${width}%`,
                          background: `linear-gradient(90deg, ${tone.hex}, ${tone.hex}22)`,
                          boxShadow: reduced ? undefined : `0 0 12px ${tone.hex}55`,
                        }}
                      />
                      <span
                        className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                        style={{ left: `${start}%`, background: tone.hex, boxShadow: `0 0 10px ${tone.hex}` }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs leading-relaxed text-snow/90" title={`${b.name} | ${b.mechanism}`}>
                        <span className="text-fog">{b.name}</span>
                        <span className="mx-1.5 text-edge">|</span>
                        {b.mechanism}
                      </p>
                    </div>
                    <Chip tone="fog" className="hidden lg:inline-flex">
                      {b.magnitude}
                    </Chip>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Tabs.Root>

        {/* detail cards for the biggest paradigm shifts */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.breakthroughs
            .filter((b) => b.lane === '架构' || b.magnitude.length > 12)
            .slice(0, 6)
            .map((b, i) => {
              const tone = laneTone[b.lane]
              return (
                <motion.article
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-12% 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="hud-panel hud-corners flex flex-col gap-3 rounded-sm p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('font-display text-lg font-semibold', tone.text)}>{b.name}</span>
                    <Chip tone="fog">{b.label}</Chip>
                  </div>
                  <p className="text-xs leading-relaxed text-fog">{b.mechanism}</p>
                  <div className="mt-auto flex flex-col gap-2 border-t border-edge/50 pt-3">
                    <HudLabel tone={b.lane === '架构' ? 'cyan' : 'amber'}>为什么重要</HudLabel>
                    <p className="text-xs leading-relaxed text-snow/80">{b.impact}</p>
                    <span className="num text-[11px]" style={{ color: tone.hex }}>
                      {b.magnitude}
                    </span>
                  </div>
                </motion.article>
              )
            })}
        </div>
      </div>
    </section>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, Download, GitBranch, Heart, Radio, Timer, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import type { Dataset } from '../data/types'
import { familyTone } from '../lib/tone'
import { daysBetween, fmtCompact, fmtDate } from '../lib/format'
import { Chip, Counter, HudLabel } from './ui/primitives'
import { cn } from '../lib/utils'

export function Hero({ data }: { data: Dataset }) {
  const reduced = useReducedMotion()
  const latest = data.releases[data.releases.length - 1]
  const totals = useMemo(() => {
    const downloads = data.releases.reduce((s, r) => s + r.downloads, 0)
    const likes = data.releases.reduce((s, r) => s + r.likes, 0)
    const first = data.releases[0].date
    return {
      downloads,
      likes,
      days: daysBetween(first, data.snapshot),
      releases: data.releases.length,
      breakthroughs: data.breakthroughs.length,
    }
  }, [data])

  return (
    <header className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 pt-24 pb-16 sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <HudLabel>open-source chronicle</HudLabel>
            <span className="h-px w-10 bg-gradient-to-r from-cyan/60 to-transparent" />
            <span className="num text-[11px] text-fog/70">
              数据快照 {fmtDate(data.snapshot)} · {data.org}
            </span>
          </motion.div>

          <div className="flex flex-col gap-4">
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.95] font-bold tracking-tight"
            >
              <span className="animate-flicker block text-snow text-glow">模型编年史</span>
              <span className="mt-1 block bg-gradient-to-r from-cyan via-mint to-violet bg-clip-text text-[clamp(1.1rem,2.6vw,2rem)] font-medium tracking-[0.02em] text-transparent">
                {data.orgName} 的三年，横轴即时间
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-sm leading-relaxed text-fog sm:text-base"
            >
              从 7B 稠密模型到 671B 稀疏专家，从 MLA 到 CSA2，这条时间轴记录了每一次开源发布、
              每一项关键技术突破、以及官方给出的实测分数和真实下载量。
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-edge/70 bg-edge/50 sm:grid-cols-4"
          >
            <Kpi icon={<GitBranch className="size-3.5" />} label="开源发布" value={<Counter to={totals.releases} format={(n) => String(Math.round(n))} />} unit="个节点" />
            <Kpi icon={<Download className="size-3.5" />} label="累计下载" value={<Counter to={totals.downloads} format={(n) => fmtCompact(n)} />} unit="次" />
            <Kpi icon={<Heart className="size-3.5" />} label="累计点赞" value={<Counter to={totals.likes} format={(n) => fmtCompact(n)} />} unit="颗" />
            <Kpi icon={<Timer className="size-3.5" />} label="跨度" value={<Counter to={totals.days} format={(n) => String(Math.round(n))} />} unit="天" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#timeline"
              className="group inline-flex items-center gap-2 rounded-sm border border-cyan/50 bg-cyan/12 px-4 py-2.5 font-mono text-xs tracking-wider text-cyan transition hover:bg-cyan/20"
            >
              进入时间轴
              <ArrowDown className="size-3.5 transition group-hover:translate-y-0.5" strokeWidth={1.8} />
            </a>
            <a
              href="#tech"
              className="inline-flex items-center gap-2 rounded-sm border border-edge px-4 py-2.5 font-mono text-xs tracking-wider text-fog transition hover:border-violet/50 hover:text-violet"
            >
              <TrendingUp className="size-3.5" strokeWidth={1.8} />
              关键技术突破
            </a>
          </motion.div>
        </div>

        {/* reactor / orbit visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[26rem]"
        >
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border"
              style={{
                inset: `${ring * 13}%`,
                borderColor: `rgba(56,226,255,${0.22 - ring * 0.05})`,
                borderStyle: ring === 1 ? 'dashed' : 'solid',
              }}
              animate={reduced ? undefined : { rotate: ring % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 58 + ring * 26, repeat: Infinity, ease: 'linear' }}
            >
              <span
                className="absolute size-1.5 rounded-full"
                style={{
                  top: -3,
                  left: '50%',
                  background: ring === 0 ? '#38e2ff' : ring === 1 ? '#9270ff' : '#2fe6a8',
                  boxShadow: '0 0 12px currentColor',
                }}
              />
            </motion.div>
          ))}

          <div className="absolute inset-[30%] grid place-items-center rounded-full border border-cyan/25 bg-void/60 backdrop-blur-sm">
            <div className="px-3 text-center">
              <HudLabel>latest</HudLabel>
              <p className={cn('mt-1 font-display text-sm font-semibold', familyTone[latest.family].text)}>
                {latest.name}
              </p>
              <p className="num mt-0.5 text-[10px] text-fog/70">{fmtDate(latest.date)}</p>
            </div>
            {!reduced ? (
              <span className="absolute inset-0 animate-pulse-ring rounded-full border border-cyan/30" />
            ) : null}
          </div>

          {data.releases
            .filter((r) => r.tier === 'flagship')
            .slice(-6)
            .map((r, i, arr) => {
              const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2
              const radius = 46
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="absolute flex items-center gap-1.5"
                  style={{
                    left: `${50 + radius * Math.cos(angle)}%`,
                    top: `${50 + radius * Math.sin(angle)}%`,
                    transform: 'translate(-50%,-50%)',
                  }}
                >
                  <span className={cn('size-1.5 rounded-full', familyTone[r.family].dot)} />
                  <span className="hidden font-mono text-[9px] tracking-wider text-fog/70 sm:inline">
                    {r.name.replace('DeepSeek-', '')}
                  </span>
                </motion.div>
              )
            })}

          <div className="absolute inset-0 animate-float">
            <div className="absolute inset-[6%] rounded-full bg-cyan/6 blur-3xl" />
          </div>
        </motion.div>
      </div>

      {/* telemetry ticker */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden border-t border-edge/40 bg-void/60 py-2 backdrop-blur-sm">
        <div className="animate-ticker flex w-max gap-6 whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-6">
              {data.releases.map((r) => (
                <span key={`${dup}-${r.id}`} className="flex items-center gap-2 font-mono text-[10px] text-fog/60">
                  <Radio className="size-3 text-cyan/50" strokeWidth={1.6} />
                  {fmtDate(r.date)}
                  <span className={familyTone[r.family].text}>{r.name}</span>
                  <Chip tone="fog">↓{fmtCompact(r.downloads)}</Chip>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

function Kpi({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  unit: string
}) {
  return (
    <div className="bg-hull/60 px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-cyan/70">
        {icon}
        <span className="label-hud">{label}</span>
      </div>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-2xl font-semibold text-snow">{value}</span>
        <span className="text-[10px] text-fog/70">{unit}</span>
      </p>
    </div>
  )
}

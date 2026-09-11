import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Download, Heart, Layers, Ruler, X } from 'lucide-react'

import type { Release } from '../data/types'
import { familyLabel, familyTone, tierTone } from '../lib/tone'
import { fmtCompact, fmtDate } from '../lib/format'
import { Chip, HudLabel } from './ui/primitives'
import { cn } from '../lib/utils'

/** Full dossier for one release: meta, technique tags, every recorded score. */
export function DetailDialog({
  release,
  onOpenChange,
}: {
  release: Release | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={!!release} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {release ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-50 bg-void/82 backdrop-blur-[3px]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="hud-panel hud-corners fixed top-1/2 left-1/2 z-50 max-h-[88vh] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md p-0"
              >
                <Dossier release={release} />
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 grid size-8 place-items-center rounded-sm border border-edge text-fog transition hover:border-cyan/50 hover:text-cyan"
                    aria-label="关闭"
                  >
                    <X className="size-4" strokeWidth={1.6} />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function Dossier({ release }: { release: Release }) {
  const tone = familyTone[release.family]
  const maxScore = release.benchmarks.reduce(
    (m, b) => (b.unit === '%' ? Math.max(m, b.score) : m),
    0,
  )

  return (
    <div className="flex flex-col">
      <header className="relative overflow-hidden border-b border-edge/80 px-6 pt-6 pb-5 sm:px-8">
        <div
          className="absolute inset-x-0 -top-24 h-48 opacity-40 blur-3xl"
          style={{ background: `radial-gradient(50% 100% at 20% 100%, ${tone.hex}, transparent)` }}
        />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <HudLabel tone="cyan">{fmtDate(release.date)}</HudLabel>
            <span className="h-px w-6 bg-edge" />
            <Chip tone="fog">{familyLabel[release.family]}</Chip>
            <Chip tone={release.tier === 'flagship' ? 'amber' : 'fog'}>
              {tierTone[release.tier].label}
            </Chip>
            {release.license ? <Chip tone="mint">{release.license}</Chip> : null}
          </div>
          <Dialog.Title asChild>
            <h3 className={cn('font-display text-3xl font-semibold tracking-tight sm:text-4xl', tone.text)}>
              {release.name}
            </h3>
          </Dialog.Title>
          <p className="max-w-3xl text-sm leading-relaxed text-snow/80">{release.summary}</p>
        </div>
      </header>

      <div className="grid gap-px bg-edge/60 sm:grid-cols-2">
        <Metric label="总参数" value={release.totalParams ?? '未公开'} icon={<Layers className="size-3.5" />} />
        <Metric
          label="激活参数"
          value={release.activatedParams ?? '稠密'}
          icon={<Layers className="size-3.5" />}
        />
        <Metric label="上下文" value={release.contextLength ?? '未标注'} icon={<Ruler className="size-3.5" />} />
        <Metric
          label="下载 / 点赞"
          value={`${fmtCompact(release.downloads)} · ${fmtCompact(release.likes)}`}
          icon={<Download className="size-3.5" />}
        />
      </div>

      {release.breakthrough ? (
        <div className="border-t border-edge/60 bg-amber/6 px-6 py-4 sm:px-8">
          <HudLabel tone="amber">关键突破</HudLabel>
          <p className="mt-1.5 text-sm leading-relaxed text-amber/95">{release.breakthrough}</p>
        </div>
      ) : null}

      <div className="border-t border-edge/60 px-6 py-5 sm:px-8">
        <HudLabel>技术标签</HudLabel>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {release.innovations.length ? (
            release.innovations.map((tag) => (
              <Chip key={tag} tone="cyan">
                {tag}
              </Chip>
            ))
          ) : (
            <span className="text-xs text-fog">官方模型卡未标注独立技术点</span>
          )}
        </div>
      </div>

      <div className="border-t border-edge/60 px-6 py-5 sm:px-8">
        <div className="flex items-baseline justify-between">
          <HudLabel>官方实测分数</HudLabel>
          <span className="font-mono text-[10px] text-fog/70">
            取自模型卡与官方技术报告，未做换算
          </span>
        </div>
        {release.benchmarks.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {release.benchmarks.slice(0, 12).map((b) => (
              <li key={b.name} className="rounded-sm border border-edge/70 bg-white/2 px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-xs text-snow/85">{b.name}</span>
                  <span className="num text-sm font-medium text-cyan">
                    {b.score}
                    <span className="ml-0.5 text-[10px] text-fog">{b.unit}</span>
                  </span>
                </div>
                {b.unit === '%' ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-edge/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${maxScore ? (b.score / Math.max(maxScore, 100)) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan/70 to-mint/80"
                    />
                  </div>
                ) : null}
                {b.note ? <p className="mt-1 font-mono text-[10px] text-fog/70">{b.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-fog">该代模型卡没有公开基准表。</p>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-edge/60 px-6 py-4 sm:px-8">
        <span className="font-mono text-[11px] text-fog/70">{release.repo}</span>
        <a
          href={`https://huggingface.co/${release.repo}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-sm border border-cyan/40 bg-cyan/10 px-3 py-1.5 font-mono text-[11px] text-cyan transition hover:bg-cyan/18"
        >
          Hugging Face 模型卡
          <ArrowUpRight className="size-3.5" strokeWidth={1.8} />
        </a>
      </footer>
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-hull/70 px-6 py-4 sm:px-8">
      <div className="flex items-center gap-1.5 text-fog/70">
        {icon}
        <span className="label-hud">{label}</span>
      </div>
      <p className="num mt-1.5 text-xl text-snow">{value}</p>
    </div>
  )
}

export { Heart }

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ChevronsLeftRight, Download, Heart, Maximize2, Sparkles } from 'lucide-react'

import type { Dataset, Family, Release, Tier } from '../data/types'
import { familyLabel, familyTone, tierTone } from '../lib/tone'
import { fmtCompact, fmtDate, yearFraction } from '../lib/format'
import { cn, mapRange } from '../lib/utils'
import { Chip, HudLabel } from './ui/primitives'
import { DetailDialog } from './DetailDialog'

/* ------------------------------------------------------------------ *
 *  Geometry
 * ------------------------------------------------------------------ */
const PAD_L = 200
const PAD_R = 420
const CARD_W = 206
const CARD_H = 92
const ROW_GAP = 112
const ROWS = 4
const GRID_TOP = 96 // breakthrough lane
const ROWS_TOP = GRID_TOP + 34
const AXIS_Y = ROWS_TOP + ROWS * ROW_GAP + 6
const BARS_BASE = AXIS_Y + 6
const BARS_MAX = 92
const RULER_Y = BARS_BASE + BARS_MAX + 34
const CANVAS_H = RULER_Y + 54

const ALL_TIERS: Tier[] = ['flagship', 'major', 'minor']
const ALL_FAMILIES: Family[] = ['LLM', 'Coder', 'Math', 'Prover', 'VL', 'Janus', 'OCR', 'Reasoning']

/** Horizontal pixel of a release, given the zoom (px per year) and origin. */
function pxOf(iso: string, zoom: number, origin: number) {
  return PAD_L + (yearFraction(iso) - origin) * zoom
}

/** Greedy row packing so labels never collide at any zoom level. */
function assignRows(list: Release[], zoom: number, origin: number) {
  const minGap = CARD_W + 26 * mapRange(zoom, 700, 2200, 0.62, 1)
  const rowEnd: number[] = Array.from({ length: ROWS }, () => -Infinity)
  const placed: { release: Release; x: number; row: number }[] = []
  for (const release of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
    const x = pxOf(release.date, zoom, origin)
    let row = rowEnd.findIndex((end) => x - end >= minGap)
    if (row === -1) {
      // all rows busy: put it on the row that frees up earliest
      row = rowEnd.indexOf(Math.min(...rowEnd))
    }
    rowEnd[row] = x
    placed.push({ release, x, row })
  }
  return placed
}

export function Timeline({ data }: { data: Dataset }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [vw, setVw] = useState(1440)
  const [vh, setVh] = useState(880)
  const [zoom, setZoom] = useState(1180)
  const [tiers, setTiers] = useState<Set<Tier>>(new Set(ALL_TIERS))
  const [families, setFamilies] = useState<Set<Family>>(new Set(ALL_FAMILIES))
  const [selected, setSelected] = useState<Release | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const visible = useMemo(
    () => data.releases.filter((r) => tiers.has(r.tier) && families.has(r.family)),
    [data.releases, tiers, families],
  )

  const { origin, span } = useMemo(() => {
    const first = Math.min(...data.releases.map((r) => yearFraction(r.date)))
    const last = Math.max(...data.releases.map((r) => yearFraction(r.date)))
    const o = first - 0.16
    return { origin: o, span: last - o + 0.22 }
  }, [data.releases])

  const trackW = span * zoom
  const maxPan = Math.max(0, trackW + PAD_R - vw)
  const sectionH = Math.max(maxPan + vh, vh * 1.6)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -maxPan])
  const x = useSpring(xRaw, {
    stiffness: reduced ? 1000 : 120,
    damping: reduced ? 100 : 30,
    mass: 0.34,
    restDelta: 0.3,
  })

  const placed = useMemo(() => assignRows(visible, zoom, origin), [visible, zoom, origin])
  const maxDownloads = useMemo(
    () => Math.max(1, ...data.releases.map((r) => r.downloads)),
    [data.releases],
  )

  const focusPlayhead = useCallback(
    (pan: number) => {
      const trackX = vw * 0.4 - pan
      let best: { id: string; d: number } | null = null
      for (const p of placed) {
        const d = Math.abs(p.x + CARD_W * 0.28 - trackX)
        if (!best || d < best.d) best = { id: p.release.id, d }
      }
      if (best) setFocusId((prev) => (prev === best!.id ? prev : best!.id))
    },
    [placed, vw],
  )

  useMotionValueEvent(x, 'change', (v) => focusPlayhead(v))
  useEffect(() => {
    focusPlayhead(maxPan ? -(scrollYProgress.get() * maxPan) : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, vw, maxPan])

  const focused = placed.find((p) => p.release.id === focusId)?.release ?? placed[0]?.release ?? null

  const seek = useCallback(
    (progress: number) => {
      const el = sectionRef.current
      if (!el) return
      const top = window.scrollY + el.getBoundingClientRect().top
      window.scrollTo({ top: top + progress * (sectionH - vh), behavior: 'auto' })
    },
    [sectionH, vh],
  )

  const nudge = useCallback(
    (dir: 1 | -1) => {
      window.scrollBy({ top: dir * Math.min(520, vw * 0.42), behavior: 'smooth' })
    },
    [vw],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nudge(1)
      if (e.key === 'ArrowLeft') nudge(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nudge])

  const toggleTier = (t: Tier) =>
    setTiers((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next.size ? next : new Set(ALL_TIERS)
    })

  const toggleFamily = (f: Family) =>
    setFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next.size ? next : new Set(ALL_FAMILIES)
    })

  const years = useMemo(() => {
    const out: number[] = []
    for (let y = Math.ceil(origin); y <= origin + span; y++) out.push(y)
    return out
  }, [origin, span])

  return (
    <section id="timeline" ref={sectionRef} className="relative" style={{ height: sectionH }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* ---------------- controls ---------------- */}
        <div className="relative z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-edge/50 bg-void/70 px-5 py-2.5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2">
            <ChevronsLeftRight className="size-3.5 text-cyan" strokeWidth={1.8} />
            <HudLabel>时间轴 · 横向滚动</HudLabel>
          </div>

          <div className="flex items-center gap-1.5">
            {ALL_TIERS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTier(t)}
                className={cn(
                  'rounded-sm border px-2 py-1 font-mono text-[10px] tracking-wider transition',
                  tiers.has(t)
                    ? 'border-cyan/45 bg-cyan/12 text-cyan'
                    : 'border-edge text-fog/60 hover:border-edge hover:text-fog',
                )}
              >
                {tierTone[t].label}
                <span className="ml-1 text-fog/50">
                  {data.releases.filter((r) => r.tier === t).length}
                </span>
              </button>
            ))}
          </div>

          <div className="no-bar flex max-w-[52ch] items-center gap-1.5 overflow-x-auto">
            {ALL_FAMILIES.filter((f) => data.releases.some((r) => r.family === f)).map((f) => (
              <button
                key={f}
                onClick={() => toggleFamily(f)}
                className={cn(
                  'rounded-sm border px-2 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap transition',
                  families.has(f)
                    ? cn('border-current/40', familyTone[f].text, familyTone[f].bg)
                    : 'border-edge text-fog/50',
                )}
              >
                {familyLabel[f]}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="label-hud hidden sm:inline">分辨率</span>
            <Slider.Root
              value={[zoom]}
              min={720}
              max={2200}
              step={20}
              onValueChange={([v]) => setZoom(v)}
              className="relative flex h-4 w-28 touch-none items-center select-none sm:w-40"
              aria-label="时间轴分辨率"
            >
              <Slider.Track className="relative h-px grow bg-edge">
                <Slider.Range className="absolute h-px bg-cyan/70" />
              </Slider.Track>
              <Slider.Thumb className="block size-3 rounded-full border border-cyan bg-void shadow-[0_0_10px_rgba(56,226,255,0.65)] focus:outline-none" />
            </Slider.Root>
            <span className="num hidden text-[10px] text-fog/70 sm:inline">
              {Math.round(zoom)}px/年
            </span>
          </div>
        </div>

        {/* ---------------- track ---------------- */}
        <div className="relative flex-1">
          <motion.div
            style={{ x, width: trackW + PAD_R }}
            className="absolute top-1/2 left-0 -translate-y-1/2"
          >
            <div className="relative" style={{ height: CANVAS_H }}>
              {/* epoch bands + ghost year numerals */}
              {years.map((y) => {
                const left = PAD_L + (y - origin) * zoom
                return (
                  <div key={y} className="absolute top-0" style={{ left, height: CANVAS_H }}>
                    <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-edge/70 to-transparent" />
                    <span className="font-display absolute -top-2 -left-1 text-[86px] leading-none font-bold text-snow/4 select-none">
                      {y}
                    </span>
                    {[0.25, 0.5, 0.75].map((q) => (
                      <div
                        key={q}
                        className="absolute h-px bg-edge/45"
                        style={{ left: q * zoom, width: 8, top: AXIS_Y }}
                      />
                    ))}
                  </div>
                )
              })}

              {/* axis beam */}
              <div
                className="absolute h-px bg-gradient-to-r from-cyan/10 via-cyan/70 to-cyan/10"
                style={{ top: AXIS_Y, left: 0, width: trackW }}
              />
              <div
                className="absolute h-[3px] blur-[3px]"
                style={{
                  top: AXIS_Y - 1,
                  left: 0,
                  width: trackW,
                  background: 'linear-gradient(90deg, transparent, rgba(56,226,255,0.5), transparent)',
                }}
              />

              {/* breakthrough markers */}
              {data.breakthroughs.map((b) => {
                const xb = pxOf(b.date, zoom, origin)
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: -6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group absolute"
                    style={{ left: xb, top: GRID_TOP - 34 }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-[10px] tracking-widest whitespace-nowrap text-amber/85 group-hover:text-amber">
                        {b.label}
                      </span>
                      <span className="size-2 rotate-45 border border-amber/70 bg-amber/25 shadow-[0_0_10px_rgba(255,181,69,0.5)]" />
                    </div>
                    <div className="absolute top-4 left-1/2 h-[calc(var(--h))] w-px -translate-x-1/2 bg-gradient-to-b from-amber/45 to-transparent" style={{ ['--h' as string]: `${AXIS_Y - GRID_TOP + 4}px`, height: AXIS_Y - GRID_TOP + 4 }} />
                  </motion.div>
                )
              })}

              {/* releases */}
              {placed.map(({ release, x: px, row }, i) => {
                const tone = familyTone[release.family]
                const cardBottom = ROWS_TOP + row * ROW_GAP + CARD_H
                const isFocus = focused?.id === release.id
                return (
                  <div key={release.id}>
                    {/* connector */}
                    <div
                      className="absolute w-px"
                      style={{
                        left: px + 14,
                        top: cardBottom,
                        height: Math.max(0, AXIS_Y - cardBottom),
                        background: `linear-gradient(180deg, ${tone.hex}55, ${tone.hex}12)`,
                      }}
                    />
                    <motion.button
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-12% 0px' }}
                      transition={{
                        duration: 0.6,
                        delay: Math.min(0.24, (i % 6) * 0.04),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => setSelected(release)}
                      data-release={release.id}
                      data-tier={release.tier}
                      className={cn(
                        'hud-panel hud-corners group absolute rounded-sm px-3 py-2.5 text-left transition duration-300',
                        release.tier === 'minor' && 'opacity-80 hover:opacity-100',
                        isFocus ? 'ring-1 ring-cyan/45' : 'hover:-translate-y-1',
                      )}
                      style={{ left: px, top: ROWS_TOP + row * ROW_GAP, width: CARD_W, height: CARD_H }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="num text-[10px] text-fog/80">{fmtDate(release.date)}</span>
                        {release.tier === 'flagship' ? (
                          <Chip tone="amber">
                            <Sparkles className="size-2.5" strokeWidth={2} />
                            旗舰
                          </Chip>
                        ) : release.tier === 'major' ? (
                          <span className="font-mono text-[9px] tracking-widest text-fog/60">
                            {familyLabel[release.family]}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          'mt-1 truncate font-display text-[13px] font-medium tracking-tight',
                          tone.text,
                        )}
                        title={release.name}
                      >
                        {release.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-fog/85">
                        <span className="inline-flex items-center gap-1">
                          <Download className="size-3" strokeWidth={1.8} />
                          {fmtCompact(release.downloads)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3" strokeWidth={1.8} />
                          {fmtCompact(release.likes)}
                        </span>
                        {release.totalParams ? (
                          <span className="ml-auto text-fog/60">{release.totalParams}</span>
                        ) : null}
                      </div>
                      <span
                        className="absolute inset-x-0 bottom-0 h-px opacity-60"
                        style={{ background: `linear-gradient(90deg, transparent, ${tone.hex}, transparent)` }}
                      />
                    </motion.button>

                    {/* axis node */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: px + 14, top: AXIS_Y }}
                    >
                      {release.tier === 'flagship' ? (
                        <span
                          className={cn(
                            'absolute inset-0 -m-2 rounded-full',
                            tone.bg,
                            !reduced && 'animate-pulse-ring',
                          )}
                        />
                      ) : null}
                      <span
                        className={cn('block rounded-full', tone.dot)}
                        style={{
                          width: tierTone[release.tier].size * 0.6,
                          height: tierTone[release.tier].size * 0.6,
                          boxShadow: `0 0 ${tierTone[release.tier].size}px ${tone.hex}`,
                        }}
                      />
                    </div>

                    {/* download columns */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, margin: '-8% 0px' }}
                      transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute origin-top rounded-b-[2px]"
                      data-bar={release.id}
                      style={{
                        left: px + 11,
                        top: BARS_BASE,
                        width: 5,
                        height: Math.max(
                          6,
                          BARS_MAX * (Math.log10(release.downloads + 1) / Math.log10(maxDownloads + 1)),
                        ),
                        background: `linear-gradient(180deg, ${tone.hex}f2, ${tone.hex}14)`,
                        boxShadow: `0 0 12px -3px ${tone.hex}`,
                      }}
                    />
                  </div>
                )
              })}

              {/* download scale: baseline + log reference lines */}
              <div className="absolute" style={{ top: BARS_BASE, left: 0, width: trackW }}>
                <div className="h-px w-full bg-gradient-to-r from-edge/15 via-edge/55 to-edge/15" />
                {[1e4, 1e5, 1e6, 1e7].map((v) => {
                  if (v > maxDownloads * 1.5) return null
                  const h = BARS_MAX * (Math.log10(v + 1) / Math.log10(maxDownloads + 1))
                  return (
                    <div key={v} className="absolute" style={{ top: h, left: 0, width: trackW }}>
                      <div className="h-px w-full bg-edge/25" />
                      {years.map((y) => (
                        <span
                          key={y}
                          className="num absolute text-[9px] text-fog/40"
                          style={{ left: PAD_L + (y - origin) * zoom + 8, top: -12 }}
                        >
                          {fmtCompact(v)}
                        </span>
                      ))}
                    </div>
                  )
                })}
                <span className="num absolute -top-5 left-6 text-[9px] tracking-widest text-fog/45">
                  近 30 天下载 · LOG
                </span>
              </div>

              {/* ruler */}
              <div className="absolute" style={{ top: RULER_Y, left: 0, width: trackW }}>
                <div className="h-px w-full bg-edge/70" />
                {years.map((y) => {
                  const left = PAD_L + (y - origin) * zoom
                  return (
                    <div key={y} className="absolute -top-3.5" style={{ left }}>
                      <div className="h-3.5 w-px bg-edge" />
                      <span className="font-display absolute top-4 left-0.5 text-[13px] font-medium tracking-wider text-snow/70">
                        {y}
                      </span>
                    </div>
                  )
                })}
                {Array.from({ length: Math.round(span * 4) }).map((_, q) => (
                  <div
                    key={q}
                    className="absolute -top-1.5 h-1.5 w-px bg-edge/60"
                    style={{ left: PAD_L + (q / 4) * zoom }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* lane rail */}
          <div
            data-rail="lanes"
            className="pointer-events-none absolute left-3 z-10 hidden lg:block"
            style={{ top: '50%', height: CANVAS_H, transform: `translateY(-${CANVAS_H / 2}px)` }}
          >
            {[
              { top: GRID_TOP - 42, label: '技术突破', cls: 'text-amber/65' },
              { top: ROWS_TOP + ROW_GAP * 1.5 - 9, label: '发布节点', cls: 'text-cyan/55' },
              { top: AXIS_Y - 9, label: '时间轴', cls: 'text-snow/45' },
              { top: BARS_BASE + BARS_MAX / 2 - 9, label: '下载柱', cls: 'text-mint/55' },
            ].map((lane) => (
              <span
                key={lane.label}
                className={cn(
                  'num absolute left-0 inline-flex items-center gap-1.5 bg-void/75 py-0.5 pr-2 text-[10px] tracking-[0.2em]',
                  lane.cls,
                )}
                style={{ top: lane.top }}
              >
                <span className="h-px w-3 bg-current opacity-60" />
                {lane.label}
              </span>
            ))}
          </div>

          {/* playhead */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-gradient-to-b from-transparent via-cyan/40 to-transparent"
            style={{ left: '40%' }}
          >
            <span className="absolute top-1/2 size-1.5 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_12px_rgba(56,226,255,0.9)]" />
          </div>

          {/* focus readout */}
          <div className="pointer-events-none absolute right-4 bottom-24 left-4 z-20 sm:left-auto sm:w-[26rem]">
            <AnimatePresence mode="wait">
              {focused ? (
                <motion.div
                  key={focused.id}
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="hud-panel hud-corners rounded-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <HudLabel>{fmtDate(focused.date)}</HudLabel>
                    <button
                      onClick={() => setSelected(focused)}
                      className="pointer-events-auto inline-flex items-center gap-1 font-mono text-[10px] text-cyan/80 hover:text-cyan"
                    >
                      完整档案
                      <Maximize2 className="size-3" strokeWidth={1.8} />
                    </button>
                  </div>
                  <h3 className={cn('mt-1.5 font-display text-xl font-semibold', familyTone[focused.family].text)}>
                    {focused.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-snow/70">
                    {focused.breakthrough ?? focused.summary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {focused.totalParams ? <Chip tone="cyan">{focused.totalParams}</Chip> : null}
                    {focused.activatedParams ? <Chip tone="mint">{focused.activatedParams}</Chip> : null}
                    {focused.contextLength ? <Chip tone="violet">{focused.contextLength}</Chip> : null}
                    <Chip tone="fog">↓{fmtCompact(focused.downloads)}</Chip>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* minimap */}
          <div className="absolute inset-x-4 bottom-5 z-20 flex items-center gap-3 sm:inset-x-8">
            <span className="label-hud hidden shrink-0 sm:inline">全览</span>
            <div
              role="presentation"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)))
              }}
              className="relative h-6 flex-1 cursor-pointer rounded-sm border border-edge/70 bg-hull/50"
            >
              {data.releases.map((r, i) => {
                const total = data.releases.length - 1 || 1
                const left = ((yearFraction(r.date) - origin) / span) * 100
                return (
                  <span
                    key={r.id}
                    className={cn(
                      'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                      familyTone[r.family].dot,
                    )}
                    style={{
                      left: `${left}%`,
                      width: r.tier === 'flagship' ? 6 : r.tier === 'major' ? 4 : 1.5,
                      height: r.tier === 'flagship' ? 6 : r.tier === 'major' ? 4 : 1.5,
                      opacity: 0.5 + (i / total) * 0.5,
                    }}
                  />
                )
              })}
              <MmProgress x={x} maxPan={maxPan} vw={vw} />
            </div>
            <span className="num hidden shrink-0 text-[10px] text-fog/60 sm:inline">
              ← → 键推进
            </span>
          </div>
        </div>
      </div>

      <DetailDialog release={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </section>
  )
}

function MmProgress({ x, maxPan, vw }: { x: MotionValue<number>; maxPan: number; vw: number }) {
  const w = Math.min(100, Math.max(7, (vw / (maxPan + vw || 1)) * 100))
  const left = useTransform(x, (v) =>
    maxPan > 0 ? `${Math.max(0, Math.min(100 - w, (-v / maxPan) * (100 - w)))}%` : '0%',
  )
  return (
    <motion.div
      style={{ left, width: `${w}%` }}
      className="pointer-events-none absolute inset-y-[3px] rounded-sm border border-cyan/40 bg-cyan/10"
    />
  )
}

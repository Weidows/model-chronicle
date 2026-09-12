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

import type { Breakthrough, Dataset, Family, OrgMeta, Release, Tier } from '../data/types'
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
const CARD_H = 88
const ROW_GAP = 104
/** Row budget for release cards. Denser datasets open more rows instead of
 *  printing cards on top of each other; the cap keeps the canvas on screen. */
const MAX_ROWS = 6
const BARS_MAX = 92

/** Vertical budget, top to bottom: ghost year digits → breakthrough label
 *  lanes → marker row → release rows → axis → download columns → ruler.
 *  Only the lane count is dynamic, the rest is fixed chrome. */
const NUMERAL_H = 58 // reserved strip for the 52px ghost year digits
const BT_LANE_H = 12 // one lane of breakthrough labels
const BT_MAX_LANES = 6 // hard cap so the band can never swallow the viewport
const BT_LANE_GAP = 12 // minimum horizontal air between two labels on a lane
const CHROME = { markerRow: 10, rowsGap: 34, barsGap: 6, rulerGap: 34, footH: 54 }

const ALL_TIERS: Tier[] = ['flagship', 'major', 'minor']
const ALL_FAMILIES: Family[] = [
  'LLM',
  'Coder',
  'Math',
  'Prover',
  'VL',
  'Janus',
  'OCR',
  'Reasoning',
  'Image',
  'Video',
  'Audio',
  'Agent',
]

/** Horizontal pixel of a release, given the zoom (px per year) and origin. */
function pxOf(iso: string, zoom: number, origin: number) {
  return PAD_L + (yearFraction(iso) - origin) * zoom
}

/** Greedy row packing so labels never collide at any zoom level. Rows open as
 *  the data gets denser; anything that still has no room is returned so the
 *  caller can fold it into a "+N" chip rather than stack it on a neighbour. */
function assignRows(list: Release[], zoom: number, origin: number) {
  const minGap = CARD_W + 26 * mapRange(zoom, 700, 2600, 0.62, 1)
  const rowEnd: number[] = []
  const placed: { release: Release; x: number; row: number }[] = []
  const overflow: { release: Release; x: number }[] = []
  for (const release of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
    const x = pxOf(release.date, zoom, origin)
    let row = rowEnd.findIndex((end) => x - end >= minGap)
    if (row === -1) {
      if (rowEnd.length < MAX_ROWS) {
        row = rowEnd.length
        rowEnd.push(-Infinity)
      } else {
        overflow.push({ release, x })
        continue
      }
    }
    rowEnd[row] = x
    placed.push({ release, x, row })
  }
  return { placed, overflow, rowCount: Math.max(1, rowEnd.length) }
}

/** JetBrains Mono at 10px with tracking-widest measures ~7px per glyph. */
function labelWidth(text: string) {
  return text.length * 7 + 8
}

/**
 * Breakthrough labels are centred on their marker, so any two dates closer than
 * one label width would print on top of each other. Pack them into as many
 * horizontal lanes as the data actually needs (capped by BT_MAX_LANES) and let
 * the band grow downward — no overlap, no wasted space when labels are sparse.
 */
function assignLanes(list: Breakthrough[], zoom: number, origin: number) {
  const items = list
    .map((b) => {
      const x = pxOf(b.date, zoom, origin)
      const w = labelWidth(b.label)
      return { b, x, w, left: x - w / 2, right: x + w / 2 }
    })
    .sort((a, b) => a.left - b.left)

  const laneEnd: number[] = []
  const tryPlace = (left: number, right: number) => {
    let lane = laneEnd.findIndex((end) => left - end >= BT_LANE_GAP)
    if (lane === -1 && laneEnd.length < BT_MAX_LANES) {
      lane = laneEnd.length
      laneEnd.push(-Infinity)
    }
    if (lane === -1) return -1
    laneEnd[lane] = Math.max(laneEnd[lane], right)
    return lane
  }

  const placed: {
    key: string
    x: number
    w: number
    lane: number
    label?: string
    b?: Breakthrough
    cluster?: string[]
  }[] = []
  const overflow: typeof items = []

  for (const it of items) {
    const lane = tryPlace(it.left, it.right)
    if (lane === -1) overflow.push(it)
    else placed.push({ key: it.b.id, x: it.x, w: it.w, lane, label: it.b.label, b: it.b })
  }

  // Lanes are full: a same-day burst of breakthroughs would print on top of each
  // other, so fold each dense cluster into one narrow "+N" chip that keeps the
  // names in its tooltip. Guarantees zero label-on-label overlap at any zoom.
  const clusters = new Map<number, { x: number; names: string[] }>()
  for (const it of overflow) {
    const key = Math.round(it.x / 28)
    const g = clusters.get(key) ?? { x: it.x, names: [] }
    g.names.push(it.b.label)
    g.x = (g.x * (g.names.length - 1) + it.x) / g.names.length
    clusters.set(key, g)
  }
  for (const [key, g] of clusters) {
    const w = 30
    let lane = tryPlace(g.x - w / 2, g.x + w / 2)
    if (lane === -1) {
      // Every lane is taken at this x too. Swap the nearest placed chip for one
      // that carries every name: a 30px chip is narrower than the label it
      // replaces, so turning a label into a cluster can only free up room.
      let best = -1
      for (let i = 0; i < placed.length; i++) {
        if (placed[i].cluster) continue
        const d = Math.abs(placed[i].x - g.x)
        if (best === -1 || d < Math.abs(placed[best].x - g.x)) best = i
      }
      if (best !== -1) {
        const victim = placed[best]
        const names = [...(victim.cluster ?? [victim.label ?? '']), ...g.names]
        placed[best] = { ...victim, w, cluster: names, label: undefined }
        continue
      }
      lane = 0
    }
    placed.push({ key: `cluster-${key}`, x: g.x, w, lane, cluster: g.names })
  }

  return { placed, laneCount: Math.max(1, laneEnd.length) }
}

interface TimelineProps {
  data: Dataset
  /** Labs available for filtering; omitted on single-lab datasets. */
  orgs?: OrgMeta[]
  /** Org ids currently switched on. */
  activeOrgs?: Set<string>
  onToggleOrg?: (id: string) => void
  /** Show the lab badge on every card (combined view). */
  showOrg?: boolean
}

const orgShort = (id: string | undefined, orgs?: OrgMeta[]) =>
  orgs?.find((o) => o.id === id)?.short ?? ''
const orgHue = (id: string | undefined, orgs?: OrgMeta[]) => orgs?.find((o) => o.id === id)?.hue ?? 190

export function Timeline({ data, orgs, activeOrgs, onToggleOrg, showOrg }: TimelineProps) {
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

  const { placed, overflow, rowCount } = useMemo(
    () => assignRows(visible, zoom, origin),
    [visible, zoom, origin],
  )

  /** Zoom floor computed by bisection: the smallest px-per-year at which the row
   *  packer seats every card without touching a neighbour. Adapts to the active
   *  filters, so "all three labs" widens the track instead of stacking cards. */
  const minZoom = useMemo(() => {
    const fits = (z: number) => assignRows(visible, z, origin).overflow.length === 0
    if (fits(720)) return 720
    let lo = 720
    let hi = 4000
    if (!fits(hi)) return hi
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2
      if (fits(mid)) hi = mid
      else lo = mid
    }
    return Math.ceil(hi / 20) * 20
  }, [visible, origin])

  useEffect(() => {
    setZoom((z) => (z < minZoom ? minZoom : z))
  }, [minZoom])

  /** Cards that still had no room (an ultra-tight same-day pile) become chips. */
  const overflowGroups = useMemo(() => {
    const groups = new Map<number, { key: number; x: number; items: typeof overflow }>()
    for (const item of overflow) {
      const k = Math.round(item.x / 26)
      const g = groups.get(k) ?? { key: k, x: item.x, items: [] }
      g.items.push(item)
      groups.set(k, g)
    }
    return [...groups.values()]
  }, [overflow])
  const { placed: btPlaced, laneCount } = useMemo(
    () => assignLanes(data.breakthroughs, zoom, origin),
    [data.breakthroughs, zoom, origin],
  )

  /** The breakthrough band sizes itself to the labels it actually carries. */
  const L = useMemo(() => {
    const markerRow = NUMERAL_H + laneCount * BT_LANE_H + CHROME.markerRow
    const rowsTop = markerRow + CHROME.rowsGap
    const axisY = rowsTop + rowCount * ROW_GAP + CHROME.barsGap
    const barsBase = axisY + CHROME.barsGap
    const rulerY = barsBase + BARS_MAX + CHROME.rulerGap
    return { markerRow, rowsTop, axisY, barsBase, rulerY, canvasH: rulerY + CHROME.footH }
  }, [laneCount, rowCount])

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

          {orgs && orgs.length > 1 ? (
            <div className="flex items-center gap-1.5">
              {orgs.map((o) => {
                const on = !activeOrgs || activeOrgs.has(o.id)
                return (
                  <button
                    key={o.id}
                    onClick={() => onToggleOrg?.(o.id)}
                    title={`${o.name} — ${o.blurb}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap transition',
                      on ? 'border-edge text-snow/90' : 'border-edge/60 text-fog/45 hover:text-fog',
                    )}
                    style={on ? { background: `hsl(${o.hue} 85% 66% / 0.13)` } : undefined}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: `hsl(${o.hue} 85% 66% / ${on ? 1 : 0.35})` }}
                    />
                    {o.short}
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="no-bar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
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
              min={minZoom}
              max={Math.max(2200, minZoom + 400)}
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
            <div className="relative" style={{ height: L.canvasH }}>
              {/* epoch bands + ghost year numerals.
                  The numerals are decorative: they live in their own reserved
                  strip above the label lanes and are hidden from a11y. */}
              {years.map((y) => {
                const left = PAD_L + (y - origin) * zoom
                return (
                  <div key={y} className="absolute top-0" style={{ left, height: L.canvasH }}>
                    <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-edge/70 to-transparent" />
                    <span
                      aria-hidden="true"
                      className="font-display absolute -top-1 left-1.5 text-[52px] leading-none font-bold text-snow/5 select-none"
                    >
                      {y}
                    </span>
                    {[0.25, 0.5, 0.75].map((q) => (
                      <div
                        key={q}
                        className="absolute h-px bg-edge/45"
                        style={{ left: q * zoom, width: 8, top: L.axisY }}
                      />
                    ))}
                  </div>
                )
              })}

              {/* axis beam */}
              <div
                className="absolute h-px bg-gradient-to-r from-cyan/10 via-cyan/70 to-cyan/10"
                style={{ top: L.axisY, left: 0, width: trackW }}
              />
              <div
                className="absolute h-[3px] blur-[3px]"
                style={{
                  top: L.axisY - 1,
                  left: 0,
                  width: trackW,
                  background: 'linear-gradient(90deg, transparent, rgba(56,226,255,0.5), transparent)',
                }}
              />

              {/* breakthrough markers — one label per packed lane, each tied back
                  to its own diamond by a stub so dense clusters stay readable */}
              {btPlaced.map(({ key, label, cluster, x: xb, w, lane }) => {
                const labelTop = NUMERAL_H + lane * BT_LANE_H
                const stubTop = labelTop + BT_LANE_H - 2
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group absolute"
                    style={{ left: xb, top: 0, width: 1, height: L.canvasH }}
                  >
                    <span
                      className="font-mono absolute block text-[10px] leading-none tracking-widest text-amber/85 transition group-hover:text-amber"
                      style={{ top: labelTop, left: -w / 2, width: w, textAlign: 'center', whiteSpace: 'nowrap' }}
                      title={cluster ? cluster.join(' · ') : undefined}
                    >
                      {cluster ? `+${cluster.length}` : label}
                    </span>
                    <span
                      className="absolute w-px bg-amber/25"
                      style={{ top: stubTop, left: -0.5, height: Math.max(2, L.markerRow - stubTop) }}
                    />
                    <span
                      className="absolute size-2 rotate-45 border border-amber/70 bg-amber/25 shadow-[0_0_10px_rgba(255,181,69,0.5)]"
                      style={{ top: L.markerRow - 4, left: -3.5 }}
                    />
                    <span
                      className="absolute w-px bg-gradient-to-b from-amber/45 to-transparent"
                      style={{ top: L.markerRow + 4, left: -0.5, height: Math.max(0, L.axisY - L.markerRow - 4) }}
                    />
                  </motion.div>
                )
              })}

              {/* releases */}
              {placed.map(({ release, x: px, row }, i) => {
                const tone = familyTone[release.family]
                const cardBottom = L.rowsTop + row * ROW_GAP + CARD_H
                const isFocus = focused?.id === release.id
                const lab = showOrg ? orgShort(release.org, orgs) : ''
                return (
                  <div key={release.id}>
                    {/* connector */}
                    <div
                      className="absolute w-px"
                      style={{
                        left: px + 14,
                        top: cardBottom,
                        height: Math.max(0, L.axisY - cardBottom),
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
                      style={{ left: px, top: L.rowsTop + row * ROW_GAP, width: CARD_W, height: CARD_H }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="num inline-flex items-center gap-1 text-[10px] text-fog/80">
                          {lab ? (
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ background: `hsl(${orgHue(release.org, orgs)} 85% 66%)` }}
                            />
                          ) : null}
                          {lab ? <span className="font-mono text-[9px] text-fog/60">{lab}</span> : null}
                          {fmtDate(release.date)}
                        </span>
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
                          'mt-1 line-clamp-2 font-display text-[12.5px] leading-[1.15] font-medium tracking-tight',
                          tone.text,
                        )}
                        title={release.name}
                      >
                        {release.name}
                      </p>
                      <div className="mt-1 flex min-w-0 items-center gap-2 font-mono text-[10px] text-fog/85">
                        <span className="inline-flex items-center gap-1">
                          <Download className="size-3" strokeWidth={1.8} />
                          {fmtCompact(release.downloads)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3" strokeWidth={1.8} />
                          {fmtCompact(release.likes)}
                        </span>
                        {release.totalParams ? (
                          <span className="ml-auto truncate text-fog/60" title={release.totalParams}>
                            {release.totalParams}
                          </span>
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
                      style={{ left: px + 14, top: L.axisY }}
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
                        top: L.barsBase,
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

              {/* same-day pile: a card that cannot be seated without touching a
                  neighbour is folded into a chip that still opens the first one */}
              {overflowGroups.map((g) => (
                <button
                  key={`pile-${g.key}`}
                  onClick={() => setSelected(g.items[0].release)}
                  title={g.items.map((i) => `${i.release.name} · ${fmtDate(i.release.date)}`).join('\n')}
                  className="absolute rounded-sm border border-cyan/45 bg-void/85 px-1 font-mono text-[9px] leading-[16px] text-cyan/85 transition hover:bg-cyan/15"
                  style={{ left: g.x, top: L.rowsTop, width: 30, height: 18 }}
                >
                  +{g.items.length}
                </button>
              ))}

              {/* download scale: baseline + log reference lines. The numeric key
                  lives in a fixed left overlay, so values never scroll under the
                  floating readout or repeat once per year. */}
              <div className="absolute" style={{ top: L.barsBase, left: 0, width: trackW }}>
                <div className="h-px w-full bg-gradient-to-r from-edge/15 via-edge/55 to-edge/15" />
                {[1e4, 1e5, 1e6, 1e7].map((v) => {
                  if (v > maxDownloads * 1.5) return null
                  const h = BARS_MAX * (Math.log10(v + 1) / Math.log10(maxDownloads + 1))
                  return <div key={v} className="absolute h-px w-full bg-edge/25" style={{ top: h }} />
                })}
              </div>

              {/* ruler */}
              <div className="absolute" style={{ top: L.rulerY, left: 0, width: trackW }}>
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
            className="pointer-events-none absolute left-3 z-10 hidden w-[13rem] lg:block"
            style={{ top: '50%', height: L.canvasH, transform: `translateY(-${L.canvasH / 2}px)` }}
          >
            {[
              {
                top: Math.max(0, NUMERAL_H + (laneCount * BT_LANE_H) / 2 - 5),
                label: '技术突破',
                cls: 'text-amber/65',
              },
              { top: L.rowsTop + ROW_GAP * 1.5 - 9, label: '发布节点', cls: 'text-cyan/55' },
              { top: L.axisY - 9, label: '时间轴', cls: 'text-snow/45' },
              { top: L.barsBase + BARS_MAX / 2 - 9, label: '下载柱', cls: 'text-mint/55' },
            ].map((lane) => (
              <span
                key={lane.label}
                className={cn(
                  'num absolute left-0 inline-flex items-center gap-1.5 bg-void/75 py-0.5 pr-2 whitespace-nowrap text-[10px] tracking-[0.2em]',
                  lane.cls,
                )}
                style={{ top: lane.top }}
              >
                <span className="h-px w-3 bg-current opacity-60" />
                {lane.label}
              </span>
            ))}
          </div>

          {/* download-axis key — pinned to the left gutter, out of the moving track */}
          <div
            data-axis="download"
            className="pointer-events-none absolute left-3 z-10 hidden w-[13rem] lg:block"
            style={{ top: '50%', height: L.canvasH, transform: `translateY(-${L.canvasH / 2}px)` }}
          >
            <span
              className="num absolute left-[7.5rem] bg-void/75 py-0.5 pr-2 whitespace-nowrap text-[9px] tracking-widest text-mint/45"
              style={{ top: L.barsBase - 22 }}
            >
              近 30 天下载 · LOG
            </span>
            {(() => {
              let last = -Infinity
              return [1e4, 1e5, 1e6, 1e7].map((v) => {
                if (v > maxDownloads * 1.5) return null
                const h = BARS_MAX * (Math.log10(v + 1) / Math.log10(maxDownloads + 1))
                // a log axis can bunch its decades together: drop a label rather
                // than print it into the one above
                if (h - last < 13) return null
                last = h
                return (
                  <span
                    key={v}
                    className="num absolute left-[7.5rem] bg-void/75 py-0.5 pr-2 text-[9px] leading-none whitespace-nowrap text-fog/45"
                    style={{ top: L.barsBase + h - 5 }}
                  >
                    {fmtCompact(v)}
                  </span>
                )
              })
            })()}
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

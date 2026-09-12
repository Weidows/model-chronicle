import { useMemo, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'

import { Analytics } from './components/Analytics'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Starfield } from './components/Starfield'
import { TechRibbon } from './components/TechRibbon'
import { Timeline } from './components/Timeline'
import { buildDataset, ORGS } from './data'
import { cn } from './lib/utils'

const NAV = [
  { href: '#timeline', label: '时间轴', id: '01' },
  { href: '#tech', label: '技术突破', id: '02' },
  { href: '#data', label: '数据面板', id: '03' },
]

const ALL_ORGS = new Set(ORGS.map((o) => o.id))

export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  const [active, setActive] = useState<Set<string>>(() => new Set(ALL_ORGS))
  const dataset = useMemo(() => buildDataset(active), [active])

  /** Click isolates a lab, Shift/Cmd-click composes a subset, clicking the solo
   *  lab again goes back to every lab. Predictable beats clever here. */
  const chooseOrg = (id: string, additive = false) =>
    setActive((prev) => {
      if (additive) {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next.size ? next : new Set(ALL_ORGS)
      }
      return prev.size === 1 && prev.has(id) ? new Set(ALL_ORGS) : new Set([id])
    })

  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-void text-snow">
      <Starfield />

      <div
        className="grid-floor pointer-events-none fixed inset-0 z-0 opacity-45"
        style={{
          maskImage: 'radial-gradient(120% 80% at 50% 0%, black 10%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(120% 80% at 50% 0%, black 10%, transparent 78%)',
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-void to-transparent" />

      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 z-50 h-px w-full origin-left bg-gradient-to-r from-cyan via-mint to-amber"
      />

      <header className="fixed top-0 z-40 w-full">
        <nav className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3.5 lg:px-10">
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute size-2 rounded-full bg-cyan" />
              <span className="absolute size-2 animate-pulse-ring rounded-full bg-cyan" />
            </span>
            <span className="label-hud whitespace-nowrap text-snow/90 transition-colors group-hover:text-cyan">
              开源模型编年史
            </span>
          </a>

          {/* lab switcher — the whole page follows this selection */}
          <div className="no-bar order-3 flex w-full items-center gap-1.5 overflow-x-auto md:order-none md:w-auto">
            <span className="label-hud hidden shrink-0 sm:inline">厂商</span>
            {ORGS.map((o) => {
              const on = active.has(o.id)
              const solo = on && active.size === 1
              return (
                <button
                  key={o.id}
                  onClick={(e) => chooseOrg(o.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                  title={`${o.name} — ${o.blurb}（Shift 多选，再点一次回到全部）`}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[10px] tracking-wider whitespace-nowrap transition',
                    on ? 'border-edge text-snow' : 'border-edge/50 text-fog/45 hover:text-fog',
                  )}
                  style={on ? { background: `hsl(${o.hue} 85% 66% / ${solo ? 0.2 : 0.1})` } : undefined}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: `hsl(${o.hue} 85% 66% / ${on ? 1 : 0.3})` }}
                  />
                  {o.short}
                </button>
              )
            })}
            <button
              onClick={() => setActive(new Set(ALL_ORGS))}
              className={cn(
                'shrink-0 rounded-sm border px-2.5 py-1.5 font-mono text-[10px] tracking-wider whitespace-nowrap transition',
                active.size === ORGS.length
                  ? 'border-cyan/45 bg-cyan/10 text-cyan'
                  : 'border-edge/50 text-fog/50 hover:text-fog',
              )}
            >
              全部
            </button>
          </div>

          <ul className="hidden items-center gap-1 xl:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group flex items-baseline gap-1.5 rounded-sm px-3 py-1.5 transition-colors hover:bg-white/4"
                >
                  <span className="num text-[9px] text-cyan/50 transition-colors group-hover:text-cyan">
                    {item.id}
                  </span>
                  <span className="font-display text-[11px] tracking-wider text-fog transition-colors group-hover:text-snow">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <span className="hidden font-mono text-[10px] tracking-wider whitespace-nowrap text-fog/55 sm:block">
            {dataset.releases.length} 节点 · SNAPSHOT {dataset.snapshot}
          </span>
        </nav>
        <div className="pointer-events-none h-14 w-full bg-gradient-to-b from-void via-void/70 to-transparent" />
      </header>

      <main className="relative z-10">
        <Hero data={dataset} />
        <Timeline
          data={dataset}
          orgs={ORGS}
          activeOrgs={active}
          onChooseOrg={chooseOrg}
          showOrg={dataset.org === 'combined'}
        />
        <TechRibbon data={dataset} />
        <Analytics data={dataset} orgs={ORGS} />
      </main>

      <Footer data={dataset} />
    </div>
  )
}

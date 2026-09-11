import { motion, useScroll, useSpring } from 'motion/react'

import { Analytics } from './components/Analytics'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Starfield } from './components/Starfield'
import { TechRibbon } from './components/TechRibbon'
import { Timeline } from './components/Timeline'
import { dataset } from './data/deepseek'

const NAV = [
  { href: '#timeline', label: '时间轴', id: '01' },
  { href: '#tech', label: '技术突破', id: '02' },
  { href: '#data', label: '数据面板', id: '03' },
]

export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

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
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute size-2 rounded-full bg-cyan" />
              <span className="absolute size-2 rounded-full bg-cyan animate-pulse-ring" />
            </span>
            <span className="label-hud text-snow/90 transition-colors group-hover:text-cyan">
              DeepSeek Chronicle
            </span>
          </a>

          <ul className="hidden items-center gap-1 sm:flex">
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

          <span className="hidden font-mono text-[10px] tracking-wider text-fog/55 md:block">
            SNAPSHOT {dataset.snapshot}
          </span>
        </nav>
        <div className="pointer-events-none h-14 w-full bg-gradient-to-b from-void via-void/70 to-transparent" />
      </header>

      <main className="relative z-10">
        <Hero data={dataset} />
        <Timeline data={dataset} />
        <TechRibbon data={dataset} />
        <Analytics data={dataset} />
      </main>

      <Footer data={dataset} />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface Star {
  x: number
  y: number
  z: number
  r: number
  tw: number
}

/**
 * Layered canvas starfield + rotating radar sweep.
 * Fixed behind everything, DPR aware, pauses when the tab is hidden.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let running = true
    let stars: Star[] = []

    const seed = () => {
      const count = Math.round(Math.min(260, (w * h) / 11_000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: 0.3 + Math.random() * 1.1,
        tw: Math.random() * Math.PI * 2,
      }))
    }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    let t = 0
    const draw = () => {
      t += 0.006
      ctx.clearRect(0, 0, w, h)

      // slow horizontal parallax drift
      const driftX = ((t * 12) % (w + 80)) - 40

      for (const s of stars) {
        const z = 0.35 + s.z * 0.65
        const x = (s.x + driftX * s.z) % w
        const twinkle = reduced ? 0.75 : 0.55 + 0.45 * Math.sin(t * 2.2 + s.tw)
        const alpha = (0.18 + s.z * 0.62) * twinkle
        const hue = s.z > 0.82 ? '56,226,255' : s.z > 0.6 ? '146,112,255' : '233,242,255'
        ctx.beginPath()
        ctx.fillStyle = `rgba(${hue},${alpha.toFixed(3)})`
        ctx.arc(x, s.y, s.r * z, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (running) draw()
      raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      running = !document.hidden
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#0d1a33_0%,#05070e_55%,#03050a_100%)]" />
      <div className="grid-floor animate-drift absolute inset-[-10%] opacity-[0.5]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="absolute top-[-18%] left-[8%] size-[46rem] rounded-full bg-cyan/8 blur-[130px]" />
      <div className="absolute top-[28%] right-[-10%] size-[38rem] rounded-full bg-violet/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_50%,transparent_35%,rgba(3,5,10,0.72)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[38vh] bg-gradient-to-b from-cyan/4 to-transparent" />
    </div>
  )
}

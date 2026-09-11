import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

/** Animates 0 -> target once the element scrolls into view. */
export function useCountUp(target: number, duration = 1.4) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const reduced = useReducedMotion()
  const value = useMotionValue(0)
  const spring = useSpring(value, { stiffness: 60, damping: 22, mass: 0.9 })

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      value.set(target)
      return
    }
    value.set(target)
  }, [inView, reduced, target, value])

  useEffect(() => {
    if (!inView || reduced) return
    const controls = spring.set
    void controls
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      // easeOutExpo keeps the last digits from crawling
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      value.set(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, target, duration, value, spring])

  return { ref, value, inView }
}

import { useRef, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'
import { useCountUp } from '../../lib/useCountUp'

/* ------------------------------------------------------------------ *
 *  Small HUD building blocks shared by every section.
 * ------------------------------------------------------------------ */

export function HudLabel({
  children,
  className,
  tone = 'cyan',
}: {
  children: ReactNode
  className?: string
  tone?: 'cyan' | 'amber' | 'fog' | 'mint'
}) {
  const tones = {
    cyan: 'text-cyan/80',
    amber: 'text-amber/80',
    mint: 'text-mint/80',
    fog: 'text-fog/70',
  } as const
  return (
    <span className={cn('label-hud', tones[tone], className)}>
      <span className="mr-1.5 inline-block size-1 translate-y-[-2px] rounded-full bg-current align-middle" />
      {children}
    </span>
  )
}

export function Panel({
  children,
  className,
  corners = true,
}: {
  children: ReactNode
  className?: string
  corners?: boolean
}) {
  return (
    <div className={cn('hud-panel', corners && 'hud-corners', className)}>{children}</div>
  )
}

export function Chip({
  children,
  className,
  tone = 'cyan',
}: {
  children: ReactNode
  className?: string
  tone?: 'cyan' | 'amber' | 'violet' | 'mint' | 'rose' | 'fog'
}) {
  const tones = {
    cyan: 'border-cyan/30 text-cyan/90 bg-cyan/8',
    amber: 'border-amber/30 text-amber/90 bg-amber/8',
    violet: 'border-violet/35 text-violet/90 bg-violet/10',
    mint: 'border-mint/30 text-mint/90 bg-mint/8',
    rose: 'border-rose/30 text-rose/90 bg-rose/8',
    fog: 'border-edge text-fog/90 bg-white/4',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** A number that counts up when it enters the viewport. */
export function Counter({
  to,
  format,
  className,
  duration,
}: {
  to: number
  format: (n: number) => string
  className?: string
  duration?: number
}) {
  const { ref, value } = useCountUp(to, duration)
  const reduced = useReducedMotion()
  return (
    <span ref={ref} className={cn('num tabular-nums', className)}>
      {reduced ? format(to) : <AnimatedNumber value={value} format={format} />}
    </span>
  )
}

function AnimatedNumber({
  value,
  format,
}: {
  value: ReturnType<typeof useMotionValue<number>>
  format: (n: number) => string
}) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const last = useRef('')
  useReactiveText(value, (v) => {
    const next = format(v)
    if (next !== last.current && nodeRef.current) {
      last.current = next
      nodeRef.current.textContent = next
    }
  })
  return <span ref={nodeRef} />
}

/** Subscribes to a MotionValue without re-rendering React on every frame. */
function useReactiveText(
  value: ReturnType<typeof useMotionValue<number>>,
  onFrame: (v: number) => void,
) {
  const cb = useRef(onFrame)
  cb.current = onFrame
  const started = useRef(false)
  if (!started.current) {
    started.current = true
    value.on('change', (v) => cb.current(v as number))
  }
}

/** Section framing: era label + big display heading + optional lede. */
export function SectionHeading({
  index,
  kicker,
  title,
  lede,
  align = 'left',
}: {
  index: string
  kicker: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'center'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center')}
    >
      <div className="flex items-center gap-3">
        <span className="num text-[11px] text-cyan/70">{index}</span>
        <span className="h-px w-8 bg-gradient-to-r from-cyan/70 to-transparent" />
        <HudLabel>{kicker}</HudLabel>
      </div>
      <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-snow sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {lede ? (
        <p className={cn('max-w-2xl text-sm leading-relaxed text-fog', align === 'center' && 'mx-auto')}>
          {lede}
        </p>
      ) : null}
    </motion.div>
  )
}

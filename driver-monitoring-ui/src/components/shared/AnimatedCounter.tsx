import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface AnimatedCounterProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export default function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
  duration = 500,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const startValue = useRef(value)
  const startTime = useRef(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    if (value === displayValue) return

    startValue.current = displayValue
    startTime.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      const current = startValue.current + (value - startValue.current) * eased
      setDisplayValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = displayValue.toFixed(decimals)

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

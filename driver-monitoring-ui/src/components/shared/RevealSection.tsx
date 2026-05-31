import { useReveal } from '../../hooks/useReveal'
import { cn } from '../../lib/utils'
import { ReactNode, ElementType } from 'react'

interface RevealSectionProps {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  threshold?: number
  as?: ElementType
}

const delayClass: Record<number, string> = {
  0: '',
  1: 'reveal-delay-1',
  2: 'reveal-delay-2',
  3: 'reveal-delay-3',
  4: 'reveal-delay-4',
  5: 'reveal-delay-5',
  6: 'reveal-delay-6',
}

export default function RevealSection({
  children,
  className,
  delay = 0,
  threshold = 0.12,
  as: Tag = 'div',
}: RevealSectionProps) {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold })

  return (
    <Tag
      ref={ref as any}
      className={cn(
        'reveal-item',
        inView && 'revealed',
        delay > 0 && delayClass[delay],
        className
      )}
    >
      {children}
    </Tag>
  )
}

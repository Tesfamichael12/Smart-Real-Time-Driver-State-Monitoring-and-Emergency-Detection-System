import { cn, getStateBadgeClass } from '../../lib/utils'

interface StatusBadgeProps {
  state: string
  className?: string
  pulsing?: boolean
}

export default function StatusBadge({ state, className, pulsing = true }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', getStateBadgeClass(state), className)}>
      {pulsing && <span className={`pulse-dot ${state === 'EMERGENCY' ? 'bg-state-emergency' : state === 'ALARM' ? 'bg-state-alarm' : state === 'WARNING' ? 'bg-state-warning' : state === 'MUTED' ? 'bg-state-muted' : 'bg-state-normal'}`} />}
      {state}
    </span>
  )
}

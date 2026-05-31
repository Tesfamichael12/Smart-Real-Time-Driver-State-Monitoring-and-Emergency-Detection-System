import { EventLog } from '../../types'
import { cn } from '../../lib/utils'
import { Activity, AlertTriangle, Bell, Info, ShieldAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface EventTimelineProps {
  events: EventLog[]
}

const eventConfig = {
  system: { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-400/10', dot: 'bg-cyan-400' },
  state_change: { icon: AlertTriangle, color: 'text-state-warning', bg: 'bg-state-warning/10', dot: 'bg-state-warning' },
  alert: { icon: Bell, color: 'text-state-alarm', bg: 'bg-state-alarm/10', dot: 'bg-state-alarm' },
  emergency: { icon: ShieldAlert, color: 'text-state-emergency', bg: 'bg-state-emergency/10', dot: 'bg-state-emergency' },
  info: { icon: Info, color: 'text-white/50', bg: 'bg-white/5', dot: 'bg-white/30' },
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events.length])

  const recent = events.slice(-30)

  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-white/50" />
          <span className="text-sm font-semibold">Event Timeline</span>
        </div>
        <span className="text-[10px] text-white/30">{events.length} events</span>
      </div>

      <div ref={scrollRef} className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
        {recent.map((event, i) => {
          const config = eventConfig[event.type]
          const Icon = config.icon

          return (
            <div
              key={event.id}
              className={cn(
                'flex items-start gap-3 p-2 rounded-lg transition-all duration-200',
                'hover:bg-white/[0.02]'
              )}
            >
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
                <Icon className={cn('w-3 h-3', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-xs', config.color)}>{event.message}</div>
                <div className="text-[10px] text-white/20 mt-0.5 font-mono">{event.timestamp}</div>
              </div>
            </div>
          )
        })}

        {recent.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">No events recorded</div>
        )}
      </div>
    </div>
  )
}

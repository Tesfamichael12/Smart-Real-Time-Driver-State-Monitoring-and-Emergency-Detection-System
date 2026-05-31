import { Alert } from '../../types'
import { cn } from '../../lib/utils'
import { Bell, Eye, Cpu, Gauge, MapPin, Wifi, X } from 'lucide-react'

interface AlertFeedProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
}

const severityConfig = {
  info: { icon: Bell, color: 'text-white/50', bg: 'bg-white/5', dot: 'bg-white/30' },
  warning: { icon: Eye, color: 'text-state-warning', bg: 'bg-state-warning/5', dot: 'bg-state-warning' },
  alarm: { icon: Cpu, color: 'text-state-alarm', bg: 'bg-state-alarm/5', dot: 'bg-state-alarm' },
  emergency: { icon: Gauge, color: 'text-state-emergency', bg: 'bg-state-emergency/5', dot: 'bg-state-emergency' },
}

const sourceIcons = {
  CV: Eye,
  ESP32: Cpu,
  MPU6050: Gauge,
  GPS: MapPin,
  GSM: Wifi,
}

export default function AlertFeed({ alerts, onAcknowledge }: AlertFeedProps) {
  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/50" />
          <span className="text-sm font-semibold">Alert Feed</span>
        </div>
        <span className="text-[10px] text-white/30">{alerts.filter(a => !a.acknowledged).length} unread</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-sm">No alerts yet</div>
        ) : (
          alerts.map(alert => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon
            const SourceIcon = sourceIcons[alert.source]

            return (
              <div
                key={alert.id}
                className={cn(
                  'alert-enter flex items-start gap-3 p-3 rounded-xl border transition-all duration-200',
                  alert.acknowledged ? 'bg-white/[0.02] border-white/5 opacity-50' : `${config.bg} border-white/10`
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-xs font-semibold', config.color)}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/30">{alert.source}</span>
                    {!alert.acknowledged && <div className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/30">{alert.driverName} · {alert.vehicleId}</span>
                    <span className="text-[10px] text-white/20">{alert.timestamp}</span>
                  </div>
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="shrink-0 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Acknowledge"
                  >
                    <X className="w-3 h-3 text-white/40" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

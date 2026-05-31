import { cn } from '../../lib/utils'
import AnimatedCounter from '../shared/AnimatedCounter'
import { VehicleData } from '../../types'
import { Truck, Users, Bell, ShieldAlert, Gauge, Activity } from 'lucide-react'

interface KPIHeroRowProps {
  vehicles: VehicleData[]
}

export default function KPIHeroRow({ vehicles }: KPIHeroRowProps) {
  const activeVehicles = vehicles.length
  const driversOnline = vehicles.length
  const activeAlerts = vehicles.filter(v => v.state !== 'NORMAL' && v.state !== 'MUTED').length
  const emergencyEvents = vehicles.filter(v => v.state === 'EMERGENCY').length
  const avgFatigue = Math.round(vehicles.reduce((sum, v) => sum + v.fatigueScore, 0) / vehicles.length)
  const inNormal = vehicles.filter(v => v.state === 'NORMAL').length
  const inWarning = vehicles.filter(v => v.state === 'WARNING').length
  const inAlarm = vehicles.filter(v => v.state === 'ALARM').length
  const inEmergency = emergencyEvents

  const kpis = [
    { icon: Truck, label: 'Active Vehicles', value: activeVehicles, color: 'text-white', bg: 'bg-white/5' },
    { icon: Users, label: 'Drivers Online', value: driversOnline, color: 'text-state-normal', bg: 'bg-state-normal/10' },
    { icon: Bell, label: 'Active Alerts', value: activeAlerts, color: activeAlerts > 0 ? 'text-state-warning' : 'text-white', bg: activeAlerts > 0 ? 'bg-state-warning/10' : 'bg-white/5' },
    { icon: ShieldAlert, label: 'Emergency Events', value: emergencyEvents, color: emergencyEvents > 0 ? 'text-state-emergency' : 'text-white', bg: emergencyEvents > 0 ? 'bg-state-emergency/10' : 'bg-white/5' },
    { icon: Gauge, label: 'Avg Fatigue', value: `${avgFatigue}%`, color: avgFatigue >= 75 ? 'text-state-warning' : avgFatigue >= 85 ? 'text-state-alarm' : 'text-white', bg: 'bg-white/5' },
    { icon: Activity, label: 'Normal / Warn / Alarm / Emerg', value: `${inNormal}/${inWarning}/${inAlarm}/${inEmergency}`, color: 'text-white', bg: 'bg-white/5' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={cn('glass-card p-4 hover:bg-white/[0.06] transition-all duration-300 animate-fade-in')}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', kpi.bg)}>
              <kpi.icon className={cn('w-4 h-4', kpi.color)} />
            </div>
          </div>
          <div className={cn('text-xl font-bold', kpi.color)}>
            <AnimatedCounter value={typeof kpi.value === 'string' ? 0 : kpi.value} />
            {typeof kpi.value === 'string' && <span>{kpi.value}</span>}
          </div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{kpi.label}</div>
        </div>
      ))}
    </div>
  )
}

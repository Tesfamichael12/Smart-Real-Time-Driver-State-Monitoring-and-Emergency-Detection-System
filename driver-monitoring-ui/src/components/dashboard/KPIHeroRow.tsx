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
    { 
      icon: Truck, 
      label: 'Active Vehicles', 
      value: activeVehicles, 
      color: 'text-white/80 group-hover:text-white', 
      border: 'hover:border-white/20',
      bg: 'bg-white/5' 
    },
    { 
      icon: Users, 
      label: 'Drivers Online', 
      value: driversOnline, 
      color: 'text-cyan-400 group-hover:text-cyan-300', 
      border: 'hover:border-cyan-500/20',
      bg: 'bg-cyan-500/10' 
    },
    { 
      icon: Bell, 
      label: 'Active Alerts', 
      value: activeAlerts, 
      color: activeAlerts > 0 ? 'text-amber-400 animate-pulse' : 'text-white/40', 
      border: activeAlerts > 0 ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'hover:border-white/20',
      bg: activeAlerts > 0 ? 'bg-amber-500/10' : 'bg-white/5' 
    },
    { 
      icon: ShieldAlert, 
      label: 'Emergency Events', 
      value: emergencyEvents, 
      color: emergencyEvents > 0 ? 'text-rose-500 animate-pulse-fast' : 'text-white/40', 
      border: emergencyEvents > 0 ? 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)] bg-rose-500/5' : 'hover:border-white/20',
      bg: emergencyEvents > 0 ? 'bg-rose-500/15' : 'bg-white/5' 
    },
    { 
      icon: Gauge, 
      label: 'Avg Fatigue', 
      value: `${avgFatigue}%`, 
      color: avgFatigue >= 80 ? 'text-rose-400' : avgFatigue >= 50 ? 'text-amber-400' : 'text-cyan-400', 
      border: avgFatigue >= 80 ? 'border-rose-500/25' : avgFatigue >= 50 ? 'border-amber-500/25' : 'hover:border-white/20',
      bg: 'bg-white/5' 
    },
    { 
      icon: Activity, 
      label: 'Normal/Warn/Alarm/Emerg', 
      value: `${inNormal}/${inWarning}/${inAlarm}/${inEmergency}`, 
      color: 'text-white/70', 
      border: 'hover:border-white/20',
      bg: 'bg-white/5' 
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={cn(
            'glass-card p-4 hover:bg-white/[0.04] transition-all duration-300 animate-fade-in group flex flex-col justify-between border border-white/10',
            kpi.border
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider leading-none">
              {kpi.label}
            </div>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.02] border border-white/5 group-hover:scale-105 transition-transform')}>
              <kpi.icon className={cn('w-3.5 h-3.5', kpi.color)} />
            </div>
          </div>

          <div className={cn('text-2xl font-black font-display tracking-tight', kpi.color)}>
            {typeof kpi.value === 'number' ? (
              <AnimatedCounter value={kpi.value} />
            ) : (
              <span>{kpi.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

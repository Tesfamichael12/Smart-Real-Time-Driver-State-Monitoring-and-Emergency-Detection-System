import { ScenarioType } from '../../data/simulation'
import { Play, AlertTriangle, Flame, ShieldOff, Camera, MapPin, Wifi, RotateCcw, Gauge, Activity } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SimulationControlsProps {
  vehicleId: string
  onTrigger: (scenario: ScenarioType) => void
}

const scenarios: { id: ScenarioType; label: string; icon: any; colorClass: string; desc: string }[] = [
  { 
    id: 'normal', 
    label: 'Normal Driving', 
    icon: Play, 
    colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]', 
    desc: 'Reset safe baseline' 
  },
  { 
    id: 'warning', 
    label: 'Warning Fatigue', 
    icon: AlertTriangle, 
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]', 
    desc: 'Fatigue ≥ 75' 
  },
  { 
    id: 'alarm', 
    label: 'Alarm Fatigue', 
    icon: Gauge, 
    colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 hover:shadow-[0_0_12px_rgba(244,63,94,0.12)]', 
    desc: 'Fatigue ≥ 85' 
  },
  { 
    id: 'critical', 
    label: 'Critical Fatigue', 
    icon: Flame, 
    colorClass: 'text-rose-500 border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]', 
    desc: 'Fatigue ≥ 90 → EMERG' 
  },
  { 
    id: 'crash', 
    label: 'Crash Event', 
    icon: Activity, 
    colorClass: 'text-rose-500 border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]', 
    desc: 'Impact + SOS Trigger' 
  },
  { 
    id: 'face_lost', 
    label: 'Face Lost', 
    icon: Camera, 
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]', 
    desc: 'Camera blocked' 
  },
  { 
    id: 'gps_fallback', 
    label: 'GPS Fallback', 
    icon: MapPin, 
    colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]', 
    desc: 'Demo coordinates' 
  },
  { 
    id: 'sos_sent', 
    label: 'SOS Sent', 
    icon: Wifi, 
    colorClass: 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]', 
    desc: 'GSM alert sent' 
  },
  { 
    id: 'mute', 
    label: 'Mute Alert', 
    icon: ShieldOff, 
    colorClass: 'text-white/40 border-white/10 bg-white/[0.02] hover:border-white/30 hover:text-white/80 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]', 
    desc: 'Silence alarm' 
  },
  { 
    id: 'reset', 
    label: 'Reset Sim', 
    icon: RotateCcw, 
    colorClass: 'text-white/40 border-white/10 bg-white/[0.02] hover:border-white/30 hover:text-white/80 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]', 
    desc: 'Reset vehicle' 
  },
]

export default function SimulationControls({ vehicleId, onTrigger }: SimulationControlsProps) {
  return (
    <div className="glass-card-strong p-6 border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white/90 font-display tracking-wide block">Scenario Simulation Controls</span>
            <span className="text-[10px] text-white/30 font-mono tracking-wider uppercase block">Hardware & API Emulator</span>
          </div>
        </div>
        <div className="text-[10px] text-white/30 font-mono">
          Target: <span className="font-bold text-cyan-400">{vehicleId}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => onTrigger(s.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 text-center select-none relative group',
              s.colorClass
            )}
            title={s.desc}
          >
            <s.icon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-wide block truncate">{s.label}</span>
              <span className="text-[8px] opacity-40 font-sans block truncate">{s.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

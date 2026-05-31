import { ScenarioType } from '../../data/simulation'
import { Play, AlertTriangle, Flame, ShieldOff, Camera, MapPin, Wifi, RotateCcw, Gauge, Activity } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SimulationControlsProps {
  vehicleId: string
  onTrigger: (scenario: ScenarioType) => void
}

const scenarios: { id: ScenarioType; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'normal', label: 'Normal Driving', icon: Play, color: 'text-state-normal border-state-normal/20 hover:bg-state-normal/10', desc: 'Reset to safe baseline' },
  { id: 'warning', label: 'Warning Fatigue', icon: AlertTriangle, color: 'text-state-warning border-state-warning/20 hover:bg-state-warning/10', desc: 'Fatigue ≥ 75' },
  { id: 'alarm', label: 'Alarm Fatigue', icon: Gauge, color: 'text-state-alarm border-state-alarm/20 hover:bg-state-alarm/10', desc: 'Fatigue ≥ 85' },
  { id: 'critical', label: 'Critical Fatigue', icon: Flame, color: 'text-state-emergency border-state-emergency/20 hover:bg-state-emergency/10', desc: 'Fatigue ≥ 90 → EMERGENCY' },
  { id: 'crash', label: 'Crash Event', icon: Activity, color: 'text-state-emergency border-state-emergency/20 hover:bg-state-emergency/10', desc: 'Crash-like impact + SOS' },
  { id: 'face_lost', label: 'Face Lost', icon: Camera, color: 'text-state-warning border-state-warning/20 hover:bg-state-warning/10', desc: 'Camera blocked' },
  { id: 'gps_fallback', label: 'GPS Fallback', icon: MapPin, color: 'text-state-warning border-state-warning/20 hover:bg-state-warning/10', desc: 'Demo coordinates' },
  { id: 'sos_sent', label: 'SOS Sent', icon: Wifi, color: 'text-state-emergency border-state-emergency/20 hover:bg-state-emergency/10', desc: 'GSM alert sent' },
  { id: 'mute', label: 'Mute / Cancel', icon: ShieldOff, color: 'text-state-muted border-state-muted/20 hover:bg-state-muted/10', desc: 'Cancel SOS' },
  { id: 'reset', label: 'Reset Sim', icon: RotateCcw, color: 'text-white/50 border-white/10 hover:bg-white/5', desc: 'Reset vehicle' },
]

export default function SimulationControls({ vehicleId, onTrigger }: SimulationControlsProps) {
  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-4 h-4 text-white/50" />
        <span className="text-sm font-semibold">Scenario Controls</span>
      </div>

      <div className="text-xs text-white/30 mb-3">
        Simulate scenarios for <span className="font-mono text-white/50">{vehicleId}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => onTrigger(s.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 text-center',
              s.color
            )}
            title={s.desc}
          >
            <s.icon className="w-4 h-4" />
            <span className="text-[10px] font-medium leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

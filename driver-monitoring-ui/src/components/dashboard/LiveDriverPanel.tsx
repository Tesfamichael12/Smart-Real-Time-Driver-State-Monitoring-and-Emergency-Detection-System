import { VehicleData } from '../../types'
import Gauge from '../shared/Gauge'
import StatusBadge from '../shared/StatusBadge'
import { Eye, Activity, BarChart3 } from 'lucide-react'

interface LiveDriverPanelProps {
  vehicle: VehicleData
}

export default function LiveDriverPanel({ vehicle }: LiveDriverPanelProps) {
  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold">Live Driver Monitoring</span>
        </div>
        <StatusBadge state={vehicle.state} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Panel */}
        <div>
          <div className="relative aspect-video rounded-xl bg-black/80 border border-white/10 overflow-hidden mb-3">
            <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
              <ellipse cx="200" cy="150" rx="80" ry="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              {vehicle.faceDetected ? (
                <>
                  <ellipse cx="160" cy="130" rx="16" ry="5" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.5" />
                  <ellipse cx="240" cy="130" rx="16" ry="5" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.5" />
                  <path d="M 175 185 Q 200 195 225 185" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" />
                  <line x1="200" y1="145" x2="200" y2="170" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="1" />
                  {Array.from({ length: 20 }).map((_, i) => (
                    <circle key={i} cx={120 + Math.random() * 160} cy={80 + Math.random() * 140} r="1" fill="rgba(34, 211, 238, 0.3)" />
                  ))}
                </>
              ) : (
                <text x="200" y="155" textAnchor="middle" fill="rgba(239, 68, 68, 0.5)" fontSize="12" fontFamily="monospace">FACE LOST</text>
              )}
            </svg>
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${vehicle.faceDetected ? 'bg-state-normal' : 'bg-state-emergency'}`} />
              <span className="text-[10px] font-mono text-white/50">{vehicle.faceDetected ? 'FACE DETECTED' : 'NO FACE'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'EAR', value: vehicle.ear.toFixed(3), color: 'text-cyan-400' },
              { label: 'MAR', value: vehicle.mar.toFixed(3), color: 'text-violet-400' },
              { label: 'PERCLOS', value: `${vehicle.perclos.toFixed(1)}%`, color: vehicle.perclos > 30 ? 'text-state-warning' : 'text-white/80' },
              { label: 'Blink Rate', value: `${vehicle.blinkRate}/min`, color: 'text-white/80' },
            ].map(m => (
              <div key={m.label} className="glass-card p-2 text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</div>
                <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fatigue & Head Pose */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Gauge
              value={vehicle.fatigueScore}
              size={140}
              strokeWidth={10}
              label="Fatigue Score"
              sublabel="/100"
            />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Head Pose</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Pitch', value: `${vehicle.headPose.pitch.toFixed(1)}°` },
                { label: 'Yaw', value: `${vehicle.headPose.yaw.toFixed(1)}°` },
                { label: 'Roll', value: `${vehicle.headPose.roll.toFixed(1)}°` },
              ].map(h => (
                <div key={h.label}>
                  <div className="text-[10px] text-white/30">{h.label}</div>
                  <div className="text-sm font-mono font-bold text-white/70">{h.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="glass-card p-3">
              <span className="text-white/30">Driver</span>
              <div className="font-medium">{vehicle.driverName}</div>
            </div>
            <div className="glass-card p-3">
              <span className="text-white/30">Vehicle</span>
              <div className="font-mono font-medium">{vehicle.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

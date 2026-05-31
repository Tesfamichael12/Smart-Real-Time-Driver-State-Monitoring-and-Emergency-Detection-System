import { VehicleData, Alert } from '../../types'
import StatusBadge from '../shared/StatusBadge'
import Gauge from '../shared/Gauge'
import { X, Eye, Cpu, Activity, Bell } from 'lucide-react'

interface DriverDetailDrawerProps {
  vehicle: VehicleData
  alerts: Alert[]
  onClose: () => void
}

export default function DriverDetailDrawer({ vehicle, alerts, onClose }: DriverDetailDrawerProps) {
  const vehicleAlerts = alerts.filter(a => a.vehicleId === vehicle.id).slice(0, 5)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-black border-l border-white/10 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">{vehicle.driverName}</h3>
            <span className="text-xs text-white/40 font-mono">{vehicle.id}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <StatusBadge state={vehicle.state} />
            <span className="text-xs text-white/30">Last updated: {new Date(vehicle.lastUpdate).toLocaleTimeString()}</span>
          </div>

          {/* Fatigue Gauge */}
          <div className="flex justify-center py-4">
            <Gauge value={vehicle.fatigueScore} size={160} strokeWidth={12} label="Fatigue Score" sublabel="/100" />
          </div>

          {/* CV Metrics */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">CV Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'EAR', value: vehicle.ear.toFixed(3) },
                { label: 'MAR', value: vehicle.mar.toFixed(3) },
                { label: 'PERCLOS', value: `${vehicle.perclos.toFixed(1)}%` },
                { label: 'Blink Rate', value: `${vehicle.blinkRate}/min` },
                { label: 'Face Detected', value: vehicle.faceDetected ? 'Yes' : 'No' },
                { label: 'Head Pose', value: `${vehicle.headPose.pitch.toFixed(0)}/${vehicle.headPose.yaw.toFixed(0)}/${vehicle.headPose.roll.toFixed(0)}` },
              ].map(m => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-white/30">{m.label}</span>
                  <span className="font-mono text-white/70">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Metrics */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Embedded Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Speed', value: `${vehicle.speed.toFixed(0)} km/h` },
                { label: 'G-Force', value: `${vehicle.gForce.toFixed(2)} G` },
                { label: 'Gyroscope', value: `${vehicle.gyroDps.toFixed(0)} °/s` },
                { label: 'Temperature', value: `${vehicle.temperature.toFixed(1)} °C` },
                { label: 'GPS', value: `${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}` },
                { label: 'SOS', value: vehicle.sosSent ? 'Sent' : 'Pending' },
              ].map(m => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-white/30">{m.label}</span>
                  <span className="font-mono text-white/70">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-white/50" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Recent Alerts</span>
            </div>
            {vehicleAlerts.length > 0 ? (
              <div className="space-y-2">
                {vehicleAlerts.map(a => (
                  <div key={a.id} className="flex items-start gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      a.severity === 'emergency' ? 'bg-state-emergency' :
                      a.severity === 'alarm' ? 'bg-state-alarm' :
                      a.severity === 'warning' ? 'bg-state-warning' : 'bg-white/30'
                    }`} />
                    <div className="flex-1">
                      <div className="text-white/70">{a.message}</div>
                      <div className="text-[10px] text-white/20">{a.timestamp} · {a.source}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/20">No recent alerts</div>
            )}
          </div>

          {/* Risk Analysis */}
          <div className="glass-card p-4 border-state-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-state-warning" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Risk Analysis</span>
            </div>
            <div className="text-sm text-white/60">
              {vehicle.fatigueScore >= 85
                ? 'High risk — immediate intervention required'
                : vehicle.fatigueScore >= 75
                ? 'Moderate risk — driver showing signs of fatigue'
                : vehicle.fatigueScore >= 50
                ? 'Low risk — monitor driver condition'
                : 'Normal — driver appears alert and attentive'}
            </div>
            <div className="mt-2 text-xs text-white/30">
              Fatigue score: {vehicle.fatigueScore}% | PERCLOS: {vehicle.perclos.toFixed(1)}% | EAR: {vehicle.ear.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

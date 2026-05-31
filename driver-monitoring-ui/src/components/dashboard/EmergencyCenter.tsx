import { VehicleData } from '../../types'
import { ShieldAlert, Clock, MapPin, Wifi, Phone, CheckCircle, XCircle, Navigation } from 'lucide-react'

interface EmergencyCenterProps {
  vehicle: VehicleData | null
  sosCountdown: number
  gsmLog: string[]
  onAcknowledge: () => void
  onCancel: () => void
  onResolve: () => void
}

export default function EmergencyCenter({ vehicle, sosCountdown, gsmLog, onAcknowledge, onCancel, onResolve }: EmergencyCenterProps) {
  if (!vehicle) {
    return (
      <div className="glass-card-strong p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-white/10 mx-auto mb-3" />
        <div className="text-sm text-white/30">No active emergency</div>
        <div className="text-xs text-white/20 mt-1">All vehicles operating normally</div>
      </div>
    )
  }

  return (
    <div className="glass-card-strong p-5 border-state-emergency/30 emergency-pulse">
      {/* Emergency Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-state-emergency/10 border border-state-emergency/30 mb-4">
        <ShieldAlert className="w-6 h-6 text-state-emergency sos-blink" />
        <div>
          <h3 className="font-bold text-state-emergency text-lg">EMERGENCY EVENT ACTIVE</h3>
          <p className="text-sm text-state-emergency/70">Immediate attention required</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
              <span className="text-xs text-white/30 block mb-1">Driver</span>
              <span className="text-sm font-bold">{vehicle.driverName}</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-xs text-white/30 block mb-1">Vehicle</span>
              <span className="text-sm font-mono font-bold">{vehicle.id}</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-xs text-white/30 block mb-1">G-Force</span>
              <span className="text-lg font-bold font-mono text-state-emergency">{vehicle.gForce.toFixed(2)} G</span>
            </div>
            <div className="glass-card p-4">
              <span className="text-xs text-white/30 block mb-1">Speed at event</span>
              <span className="text-lg font-bold font-mono">{vehicle.speed.toFixed(0)} km/h</span>
            </div>
          </div>

          {/* SOS Countdown */}
          {sosCountdown > 0 && (
            <div className="glass-card p-4 border-state-emergency/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-state-emergency" />
                <span className="text-sm font-semibold text-state-emergency">SOS will be sent in {sosCountdown}s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-state-emergency animate-countdown"
                  style={{ width: `${(sosCountdown / 8) * 100}%`, transition: 'width 1s linear' }}
                />
              </div>
            </div>
          )}

          {vehicle.sosSent && (
            <div className="glass-card p-4 border-state-emergency/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-state-emergency" />
                <span className="text-sm font-semibold text-state-emergency">SOS MESSAGE SENT</span>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-state-normal" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Location</span>
            </div>
            <div className="font-mono text-sm text-white/70">
              {vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}
            </div>
            <a
              href={`https://maps.google.com/?q=${vehicle.lat.toFixed(6)},${vehicle.lng.toFixed(6)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-400 mt-1"
            >
              <Navigation className="w-3 h-3" />
              Open in Google Maps
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {sosCountdown > 0 && (
              <button onClick={onCancel} className="btn-secondary flex items-center gap-2 text-xs">
                <XCircle className="w-4 h-4" />
                Cancel SOS
              </button>
            )}
            <button onClick={onAcknowledge} className="btn-primary flex items-center gap-2 text-xs">
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </button>
            <button onClick={onResolve} className="btn-ghost border border-white/10 rounded-xl px-4 py-2 text-xs">
              Mark Resolved
            </button>
          </div>
        </div>

        {/* GSM Log */}
        <div className="glass-card p-4 bg-black/60">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-state-emergency" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">GSM AT Command Log</span>
          </div>
          {gsmLog.length > 0 ? (
            <div className="space-y-1 max-h-[360px] overflow-y-auto">
              {gsmLog.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`text-[11px] font-mono leading-relaxed ${
                    line.startsWith('>') ? 'text-cyan-400/70' :
                    line.includes('ERROR') ? 'text-state-emergency' :
                    line.includes('SUCCESSFULLY') ? 'text-state-normal' :
                    line.includes('AT') || line.includes('OK') ? 'text-white/40' :
                    line.includes('Ctrl+Z') ? 'text-state-warning' :
                    'text-white/50'
                  }`}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/20 py-4 text-center font-mono">Awaiting GSM command log...</div>
          )}
        </div>
      </div>
    </div>
  )
}

import { VehicleData } from '../../types'
import AnimatedCounter from '../shared/AnimatedCounter'
import { Gauge, Thermometer, Navigation, Radio, Activity } from 'lucide-react'

interface EmbeddedTelemetryPanelProps {
  vehicle: VehicleData
}

export default function EmbeddedTelemetryPanel({ vehicle }: EmbeddedTelemetryPanelProps) {
  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold">Embedded Telemetry</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* G-Force */}
        <div className="glass-card p-3 text-center">
          <Gauge className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <div className="text-xs text-white/30 uppercase tracking-wider mb-1">G-Force</div>
          <div className="text-lg font-bold font-mono" style={{ color: vehicle.gForce >= 3.0 ? '#ef4444' : vehicle.gForce >= 2.2 ? '#f97316' : vehicle.gForce >= 1.6 ? '#eab308' : '#22c55e' }}>
            <AnimatedCounter value={vehicle.gForce} decimals={2} suffix=" G" />
          </div>
          {vehicle.crashDetected && (
            <div className="text-[10px] font-bold text-state-emergency animate-pulse mt-1">CRASH DETECTED</div>
          )}
        </div>

        {/* Gyroscope */}
        <div className="glass-card p-3 text-center">
          <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Gyroscope</div>
          <div className="text-lg font-bold font-mono text-white/80">
            <AnimatedCounter value={vehicle.gyroDps} decimals={0} suffix=" °/s" />
          </div>
        </div>

        {/* Speed */}
        <div className="glass-card p-3 text-center">
          <Gauge className="w-4 h-4 text-white/50 mx-auto mb-1" />
          <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Speed</div>
          <div className="text-lg font-bold font-mono text-white/80">
            <AnimatedCounter value={vehicle.speed} decimals={0} suffix=" km/h" />
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card p-3 text-center">
          <Thermometer className="w-4 h-4 text-white/50 mx-auto mb-1" />
          <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Temperature</div>
          <div className="text-lg font-bold font-mono text-white/80">
            <AnimatedCounter value={vehicle.temperature} decimals={1} suffix=" °C" />
          </div>
        </div>
      </div>

      {/* GPS & Status */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-3.5 h-3.5 text-state-normal" />
            <span className="text-xs text-white/30 uppercase tracking-wider">GPS Position</span>
          </div>
          <div className="text-xs font-mono text-white/60">{vehicle.lat.toFixed(6)}</div>
          <div className="text-xs font-mono text-white/60">{vehicle.lng.toFixed(6)}</div>
        </div>

        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-3.5 h-3.5 text-state-normal" />
            <span className="text-xs text-white/30 uppercase tracking-wider">System Status</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/30">State</span>
              <span className="font-semibold font-mono" style={{ color: vehicle.state === 'EMERGENCY' ? '#ef4444' : vehicle.state === 'ALARM' ? '#f97316' : vehicle.state === 'WARNING' ? '#eab308' : '#22c55e' }}>
                {vehicle.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">SOS Sent</span>
              <span className={vehicle.sosSent ? 'text-state-emergency font-bold' : 'text-white/40'}>{vehicle.sosSent ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">Crash</span>
              <span className={vehicle.crashDetected ? 'text-state-emergency font-bold animate-pulse' : 'text-white/40'}>{vehicle.crashDetected ? 'DETECTED' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESP32 Data Payload */}
      <div className="mt-3 glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">ESP32 JSON Output</span>
          <span className="text-[10px] text-white/20">1s interval</span>
        </div>
        <pre className="text-[10px] font-mono text-white/40 leading-relaxed overflow-x-auto">
{`{
  "vehicleId": "${vehicle.id}",
  "speedKmph": ${vehicle.speed.toFixed(1)},
  "gForce": ${vehicle.gForce.toFixed(2)},
  "gyroDps": ${vehicle.gyroDps.toFixed(1)},
  "temperatureC": ${vehicle.temperature.toFixed(1)},
  "gpsValid": true,
  "lat": ${vehicle.lat.toFixed(6)},
  "lng": ${vehicle.lng.toFixed(6)},
  "state": "${vehicle.state}",
  "sosSent": ${vehicle.sosSent}
}`}
        </pre>
      </div>
    </div>
  )
}

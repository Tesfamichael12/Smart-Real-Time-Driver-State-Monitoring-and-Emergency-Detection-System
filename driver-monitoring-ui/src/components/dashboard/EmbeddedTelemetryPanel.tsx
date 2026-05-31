import { VehicleData } from '../../types'
import AnimatedCounter from '../shared/AnimatedCounter'
import { Gauge, Thermometer, Navigation, Radio, Activity, Terminal, ShieldAlert } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmbeddedTelemetryPanelProps {
  vehicle: VehicleData
}

export default function EmbeddedTelemetryPanel({ vehicle }: EmbeddedTelemetryPanelProps) {
  const isCrash = vehicle.crashDetected
  
  return (
    <div className={cn(
      "glass-card-strong p-6 transition-all duration-500 relative overflow-hidden border",
      isCrash ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse" : "border-white/10"
    )}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white/90 font-display tracking-wide block">Embedded Telemetry</span>
            <span className="text-[10px] text-white/30 font-mono tracking-wider uppercase block">ESP32 & MPU6050 Sensors</span>
          </div>
        </div>

        {isCrash && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold font-mono tracking-widest uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            CRASH DETECTED
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* G-Force */}
        <div className={cn(
          "glass-card p-4 text-center border transition-all duration-300 relative group overflow-hidden",
          vehicle.gForce >= 3.0 ? "border-rose-500/30 bg-rose-500/5" :
          vehicle.gForce >= 1.6 ? "border-amber-500/25 bg-amber-500/5" :
          "border-white/10 hover:border-cyan-500/20"
        )}>
          <Gauge className="w-4 h-4 text-amber-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 font-mono">G-Force</div>
          <div className="text-xl font-black font-mono tracking-tight" style={{ color: vehicle.gForce >= 3.0 ? '#ef4444' : vehicle.gForce >= 2.2 ? '#f97316' : vehicle.gForce >= 1.6 ? '#eab308' : '#06b6d4' }}>
            <AnimatedCounter value={vehicle.gForce} decimals={2} suffix=" G" />
          </div>
        </div>

        {/* Gyroscope */}
        <div className="glass-card p-4 text-center border border-white/10 hover:border-cyan-500/20 transition-all duration-300 group">
          <Activity className="w-4 h-4 text-violet-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Gyroscope</div>
          <div className="text-xl font-black font-mono tracking-tight text-white/90">
            <AnimatedCounter value={vehicle.gyroDps} decimals={0} suffix=" °/s" />
          </div>
        </div>

        {/* Speed */}
        <div className="glass-card p-4 text-center border border-white/10 hover:border-cyan-500/20 transition-all duration-300 group">
          <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Speed</div>
          <div className="text-xl font-black font-mono tracking-tight text-white/90">
            <AnimatedCounter value={vehicle.speed} decimals={0} suffix=" km/h" />
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card p-4 text-center border border-white/10 hover:border-cyan-500/20 transition-all duration-300 group">
          <Thermometer className="w-4 h-4 text-rose-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Temperature</div>
          <div className="text-xl font-black font-mono tracking-tight text-white/90">
            <AnimatedCounter value={vehicle.temperature} decimals={1} suffix=" °C" />
          </div>
        </div>
      </div>

      {/* GPS & Status */}
      <div className="grid grid-cols-2 gap-3.5 mt-3.5">
        <div className="glass-card p-4 border border-white/10 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">GPS Coordinates</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/30">Latitude</span>
              <span className="text-white/80 font-bold">{vehicle.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/30">Longitude</span>
              <span className="text-white/80 font-bold">{vehicle.lng.toFixed(6)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2.5">
            <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">Signal Outputs</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/30">State</span>
              <span className="font-bold font-mono text-[11px]" style={{ color: vehicle.state === 'EMERGENCY' ? '#ef4444' : vehicle.state === 'ALARM' ? '#f97316' : vehicle.state === 'WARNING' ? '#eab308' : '#10b981' }}>
                {vehicle.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">SOS Transmit</span>
              <span className={cn('font-bold font-mono text-[11px]', vehicle.sosSent ? 'text-rose-500' : 'text-white/40')}>{vehicle.sosSent ? 'ACTIVE' : 'IDLE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESP32 Data Payload */}
      <div className="mt-3.5 glass-card p-4 border border-white/10 relative overflow-hidden bg-black/60">
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.02]">
          <Terminal className="w-48 h-48 -mr-10 -mb-10 text-white" />
        </div>
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">
            <Terminal className="w-3 h-3 text-cyan-400" />
            ESP32 JSON Stream
          </div>
          <span className="text-[9px] text-white/20 font-mono">1000ms Refresh</span>
        </div>
        <pre className="text-[10px] font-mono text-cyan-400/70 leading-relaxed overflow-x-auto selection:bg-cyan-500/20">
{`{
  "vehicleId": "${vehicle.id}",
  "speedKmph": ${vehicle.speed.toFixed(1)},
  "gForce": ${vehicle.gForce.toFixed(2)},
  "gyroDps": ${vehicle.gyroDps.toFixed(1)},
  "temperatureC": ${vehicle.temperature.toFixed(1)},
  "state": "${vehicle.state}",
  "sosSent": ${vehicle.sosSent}
}`}
        </pre>
      </div>
    </div>
  )
}

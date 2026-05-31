import { VehicleData } from '../../types'
import Gauge from '../shared/Gauge'
import StatusBadge from '../shared/StatusBadge'
import { Eye, Activity, Info, Video, Cpu } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LiveDriverPanelProps {
  vehicle: VehicleData
}

export default function LiveDriverPanel({ vehicle }: LiveDriverPanelProps) {
  const isWarning = vehicle.state === 'WARNING'
  const isAlarm = vehicle.state === 'ALARM'
  const isEmergency = vehicle.state === 'EMERGENCY'
  
  return (
    <div className={cn(
      "glass-card-strong p-6 transition-all duration-500 relative overflow-hidden border",
      isEmergency ? "border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.08)]" :
      isAlarm ? "border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]" :
      isWarning ? "border-amber-500/25 shadow-[0_0_25px_rgba(245,158,11,0.05)]" :
      "border-white/10"
    )}>
      {/* Dynamic Backglow for alert states */}
      {isEmergency && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse-slow" />
      )}
      {isWarning && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse-slow" />
      )}

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white/90 font-display tracking-wide block">Live Driver Biometrics</span>
            <span className="text-[10px] text-white/30 font-mono tracking-wider uppercase block">AI Vision Stream</span>
          </div>
        </div>
        <StatusBadge state={vehicle.state} />
      </div>

      <div className="grid xl:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
        {/* Camera Panel (Takes up more space for a wider view) */}
        <div className="xl:col-span-2 lg:col-span-3 flex flex-col">
          <div className={cn(
            "relative aspect-video w-full rounded-xl bg-black border overflow-hidden mb-4 transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]",
            isEmergency ? "border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]" :
            isAlarm ? "border-rose-500/35 shadow-[0_0_20px_rgba(244,63,94,0.1)]" :
            isWarning ? "border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.08)]" :
            "border-white/10"
          )}>
            <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full">
              {/* Grid Lines */}
              <pattern id="grid-live" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.02)" strokeWidth="1"/>
              </pattern>
              <rect width="800" height="450" fill="url(#grid-live)" />

              {/* Group Centered for the Face */}
              <g transform="translate(200, 75)">
                {/* Crosshairs */}
                <path d="M 0 150 L 400 150 M 200 0 L 200 300" stroke="rgba(6,182,212,0.12)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="200" cy="150" r="140" fill="none" stroke="rgba(6,182,212,0.03)" strokeWidth="1" />
                <circle cx="200" cy="150" r="100" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                
                {vehicle.faceDetected ? (
                  <>
                    {/* Detailed Face Outline */}
                    <path d="M 110 120 Q 110 50 200 40 Q 290 50 290 120 Q 290 220 200 260 Q 110 220 110 120" fill="none" stroke={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.4)" : isWarning ? "rgba(245,158,11,0.4)" : "rgba(6,182,212,0.25)")} strokeWidth="1.5" />
                    
                    {/* Left Eye */}
                    <path d="M 140 130 Q 160 115 180 130 Q 160 145 140 130 Z" fill="rgba(6,182,212,0.05)" stroke={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.7)" : isWarning ? "rgba(245,158,11,0.7)" : "rgba(6,182,212,0.7)")} strokeWidth="1.5" />
                    <circle cx="160" cy="130" r="3.5" fill={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.9)" : isWarning ? "rgba(245,158,11,0.9)" : "rgba(6,182,212,0.9)")} />
                    <circle cx="160" cy="130" r="7.5" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                    
                    {/* Right Eye */}
                    <path d="M 220 130 Q 240 115 260 130 Q 240 145 220 130 Z" fill="rgba(6,182,212,0.05)" stroke={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.7)" : isWarning ? "rgba(245,158,11,0.7)" : "rgba(6,182,212,0.7)")} strokeWidth="1.5" />
                    <circle cx="240" cy="130" r="3.5" fill={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.9)" : isWarning ? "rgba(245,158,11,0.9)" : "rgba(6,182,212,0.9)")} />
                    <circle cx="240" cy="130" r="7.5" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                    
                    {/* Mouth */}
                    <path d="M 160 200 Q 200 190 240 200 Q 200 225 160 200 Z" fill={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.1)" : isWarning ? "rgba(245,158,11,0.1)" : "rgba(139,92,246,0.1)")} stroke={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.7)" : isWarning ? "rgba(245,158,11,0.7)" : "rgba(139,92,246,0.7)")} strokeWidth="1.5" />
                    
                    {/* Nose Wireframe */}
                    <path d="M 200 140 L 185 175 L 215 175 Z" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
                    <line x1="200" y1="140" x2="200" y2="175" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
                    
                    {/* Landmark Nodes */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const angle = (i / 48) * Math.PI * 2;
                      const rad = 70 + (i % 3) * 15;
                      const cx = 200 + Math.cos(angle) * rad;
                      const cy = 150 + Math.sin(angle) * rad;
                      return (
                        <circle key={i} cx={cx} cy={cy} r="1.5" fill={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.5)" : "rgba(6,182,212,0.5)")} />
                      )
                    })}
                    
                    {/* Connection Lines (fake mesh) */}
                    {Array.from({ length: 24 }).map((_, i) => {
                      const angle1 = (i / 24) * Math.PI * 2;
                      const angle2 = angle1 + 0.5;
                      const rad1 = 70 + (i % 2) * 20;
                      const rad2 = 70 + ((i + 1) % 2) * 20;
                      return (
                        <line 
                          key={i} 
                          x1={200 + Math.cos(angle1) * rad1} 
                          y1={150 + Math.sin(angle1) * rad1} 
                          x2={200 + Math.cos(angle2) * rad2} 
                          y2={150 + Math.sin(angle2) * rad2} 
                          stroke="rgba(6,182,212,0.12)" 
                          strokeWidth="1" 
                        />
                      )
                    })}
 
                    {/* Scanning Laser */}
                    <line x1="80" y1="50" x2="320" y2="50" stroke={cn("transition-colors duration-300", isEmergency || isAlarm ? "rgba(244,63,94,0.6)" : isWarning ? "rgba(245,158,11,0.6)" : "rgba(6,182,212,0.6)")} strokeWidth="2" filter="blur(1px)">
                      <animate attributeName="y1" values="50;250;50" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="y2" values="50;250;50" dur="3s" repeatCount="indefinite" />
                    </line>
                  </>
                ) : (
                  <text x="200" y="160" textAnchor="middle" fill="rgba(244,63,94,0.9)" fontSize="20" fontFamily="monospace" letterSpacing="4" fontWeight="bold" className="animate-pulse">FEED LOST</text>
                )}
              </g>
            </svg>

            {/* Video overlay badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <div className={`w-2 h-2 rounded-full ${vehicle.faceDetected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse-fast'}`} />
              <span className="text-[10px] font-bold font-mono tracking-wider text-white/80">{vehicle.faceDetected ? 'TRACKING ON' : 'NO SUBJECT'}</span>
            </div>
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Cpu className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-bold font-mono text-cyan-400">468 PTS</span>
              <span className="text-white/20 text-[10px] font-mono">|</span>
              <span className="text-[10px] font-bold font-mono text-white/60">30 FPS</span>
            </div>
          </div>
 
          {/* Telemetry quick metrics grid */}
          <div className="grid grid-cols-4 gap-3 mt-auto">
            {[
              { label: 'EAR', value: vehicle.ear.toFixed(3), color: 'text-cyan-400', threshold: '0.23' },
              { label: 'MAR', value: vehicle.mar.toFixed(3), color: 'text-violet-400', threshold: '0.60' },
              { label: 'PERCLOS', value: `${vehicle.perclos.toFixed(1)}%`, color: vehicle.perclos > 30 ? 'text-amber-400' : 'text-white/80', threshold: '30%' },
              { label: 'Blink Rate', value: `${vehicle.blinkRate}`, unit: '/min', color: 'text-emerald-400', threshold: '~15' },
            ].map(m => (
              <div key={m.label} className="glass-card p-3 flex flex-col justify-center relative overflow-hidden group border border-white/10 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{m.label}</div>
                  <div className="text-[8px] text-white/20 font-mono hidden sm:block">TH:{m.threshold}</div>
                </div>
                <div className={`text-base font-black font-mono tracking-tight ${m.color}`}>
                  {m.value}
                  {m.unit && <span className="text-[9px] text-white/30 ml-0.5 font-sans font-normal">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Fatigue & Head Pose (Takes up 1/3 of space) */}
        <div className="space-y-4 xl:col-span-1 lg:col-span-2 flex flex-col">
          <div className="glass-card p-6 flex-1 flex flex-col items-center justify-center relative border border-white/10 hover:border-cyan-500/20 transition-all duration-300">
            <div className="absolute top-4 left-4 text-[9px] font-bold text-white/30 uppercase tracking-wider font-mono">Fatigue Analytics</div>
            <Gauge
              value={vehicle.fatigueScore}
              size={180}
              strokeWidth={12}
              label="Fatigue Index"
              sublabel="/100"
            />
          </div>
 
          {/* Head Pose Orientation */}
          <div className="glass-card p-5 relative overflow-hidden border border-white/10">
            <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono">Head Pose Orientation</span>
            </div>
            
            <div className="space-y-3.5 relative z-10">
              {[
                { label: 'Pitch', value: vehicle.headPose.pitch, color: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]' },
                { label: 'Yaw', value: vehicle.headPose.yaw, color: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]' },
                { label: 'Roll', value: vehicle.headPose.roll, color: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
              ].map(h => (
                <div key={h.label}>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-white/40">{h.label}</span>
                    <span className="font-bold text-white/80">{h.value.toFixed(1)}°</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    {/* Zero-center indicator */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />
                    
                    {/* Fill bar (moves left/right from center depending on angle) */}
                    <div 
                      className={`absolute top-0 bottom-0 ${h.color} rounded-full transition-all duration-300`}
                      style={{ 
                        left: h.value < 0 ? `${50 + (h.value / 45) * 50}%` : '50%',
                        right: h.value >= 0 ? `${50 - (h.value / 45) * 50}%` : '50%',
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Driver Metadata */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="glass-card p-3 flex items-center gap-2.5 border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-[10px] font-black text-cyan-400 font-mono">DR</span>
              </div>
              <div className="min-w-0">
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Driver</div>
                <div className="text-xs font-bold text-white/90 truncate font-display">{vehicle.driverName}</div>
              </div>
            </div>
            <div className="glass-card p-3 flex flex-col justify-center border border-white/10">
              <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Plate ID</div>
              <div className="text-xs font-mono font-bold text-white/90">{vehicle.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

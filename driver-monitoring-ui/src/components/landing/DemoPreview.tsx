import { Play, Activity, MapPin, Gauge, Bell } from 'lucide-react'

export default function DemoPreview({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <section id="demo" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Live Demo Preview</h2>
          <p className="section-subtitle">Real-time data simulation showing the system in action</p>
        </div>

        <div className="glass-card-strong p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Driver Panel */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Driver Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Driver</span>
                  <span className="text-sm font-medium">Tesfa A.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Vehicle</span>
                  <span className="text-sm font-mono">VEH-001</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">State</span>
                  <span className="state-badge state-normal text-[10px]">NORMAL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Fatigue</span>
                  <span className="text-sm font-mono text-state-normal">32%</span>
                </div>
              </div>
            </div>

            {/* Telemetry Panel */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Telemetry</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Speed</span>
                  <span className="text-sm font-mono">64 km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">G-Force</span>
                  <span className="text-sm font-mono">1.02 G</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Gyroscope</span>
                  <span className="text-sm font-mono">18 deg/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Temp</span>
                  <span className="text-sm font-mono">36.2 °C</span>
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-state-emergency" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Alert Feed</span>
              </div>
              <div className="space-y-2">
                {[
                  { msg: 'System online · All sensors OK', time: '00:32', type: 'info' },
                  { msg: 'CV module initialized', time: '00:32', type: 'info' },
                  { msg: 'ESP32 telemetry active', time: '00:31', type: 'info' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-state-normal mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-white/50">{alert.msg}</span>
                      <span className="text-white/20 ml-2">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <span className="font-mono text-white/30">9.0301, 38.7613</span>
                  <span className="text-white/20">|</span>
                  <span className="text-white/30">AASTU Campus</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={onOpenDashboard} className="btn-primary inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              Open Full Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

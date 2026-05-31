import { ArrowRight, Play, Shield, Camera, Cpu, MapPin, Wifi, CircuitBoard } from 'lucide-react'

const techBadges = [
  { label: 'Computer Vision', icon: Camera },
  { label: 'ESP32', icon: Cpu },
  { label: 'MPU6050', icon: CircuitBoard },
  { label: 'GPS', icon: MapPin },
  { label: 'GSM SOS', icon: Wifi },
  { label: 'Wokwi Sim', icon: Play },
]

export default function Hero({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <section id="overview" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
        {/* Grid pattern */}
        <div className="absolute inset-0 map-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              <Shield className="w-4 h-4 text-white/80" />
              Academic Embedded Systems Project · 2025/26
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-gradient">Real-Time Driver State Monitoring</span>
              <br />
              <span className="text-white/80">and Emergency Detection System</span>
            </h1>

            <p className="text-lg md:text-xl text-white/40 leading-relaxed max-w-xl">
              An integrated safety platform combining computer vision fatigue detection with
              embedded crash response. Detects drowsiness before accidents and triggers
              emergency alerts when every second counts.
            </p>

            <div className="flex flex-wrap gap-4">
              <button onClick={onOpenDashboard} className="btn-primary flex items-center gap-2">
                <Play className="w-4 h-4" />
                Launch Live Simulation
              </button>
              <a href="#architecture" className="btn-secondary flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Explore Architecture
              </a>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              {techBadges.map(badge => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-medium text-white/50"
                >
                  <badge.icon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Product Mockup */}
          <div className="relative hidden lg:block">
            <div className="relative glass-card-strong p-4 space-y-3">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-state-emergency animate-pulse-fast" />
                  <span className="text-xs font-mono text-white/40">LIVE</span>
                </div>
                <span className="text-xs font-mono text-white/30">SafeDrive Guardian v1.0</span>
              </div>

              {/* Mock Camera Panel */}
              <div className="relative aspect-video rounded-lg bg-black/60 border border-white/10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-48">
                    {/* Face outline */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                    {/* Eyes */}
                    <div className="absolute top-1/4 left-1/4 w-6 h-3 rounded-full border border-cyan-400/50 animate-pulse-slow" />
                    <div className="absolute top-1/4 right-1/4 w-6 h-3 rounded-full border border-cyan-400/50 animate-pulse-slow" />
                    {/* Nose */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400/30 rounded-full" />
                    {/* Mouth */}
                    <div className="absolute bottom-1/4 left-1/3 right-1/3 h-2 border border-violet-400/30 rounded-b-lg" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  </div>
                </div>
                {/* Camera overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-state-normal" />
                  <span className="text-[10px] font-mono text-white/60">CAM-01</span>
                </div>
                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20" />
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Fatigue', value: '32', unit: '%', color: 'text-state-normal' },
                  { label: 'EAR', value: '0.31', unit: '', color: 'text-white/80' },
                  { label: 'Speed', value: '64', unit: 'km/h', color: 'text-white/80' },
                  { label: 'PERCLOS', value: '8', unit: '%', color: 'text-white/80' },
                ].map(metric => (
                  <div key={metric.label} className="glass-card p-2 text-center">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{metric.label}</div>
                    <div className={`text-sm font-bold font-mono ${metric.color}`}>
                      {metric.value}
                      <span className="text-[10px] text-white/30 ml-0.5">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Row */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="state-badge state-normal text-[10px]">NORMAL</span>
                  <span className="text-xs text-white/40">Driver Tesfa A. · VEH-001</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] font-mono text-white/30">9.0301, 38.7613</span>
                </div>
              </div>
            </div>

            {/* Floating card decorations */}
            <div className="absolute -top-4 -right-4 glass-card-strong p-3 animate-pulse-slow">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-state-emergency" />
                <span className="text-xs font-mono text-white/80">SOS Ready</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 glass-card-strong p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-state-normal animate-pulse" />
                <span className="text-xs font-mono text-white/60">5 Vehicles Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator">
        <span className="text-xs text-white/20 font-mono">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/30" />
        </div>
      </div>
    </section>
  )
}

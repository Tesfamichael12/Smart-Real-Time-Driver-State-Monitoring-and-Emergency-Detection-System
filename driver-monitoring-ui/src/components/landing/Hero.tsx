import { ArrowRight, Play, Shield, Camera, Cpu, MapPin, Wifi, CircuitBoard, ChevronDown } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { scrollToSection } from '../../hooks/useLenis'

const techBadges = [
  { label: 'Computer Vision', icon: Camera, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  { label: 'ESP32 MCU', icon: Cpu, color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  { label: 'MPU6050 IMU', icon: CircuitBoard, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { label: 'GPS Tracking', icon: MapPin, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { label: 'GSM SOS Alert', icon: Wifi, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  { label: 'Wokwi Sim', icon: Play, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
]

const metrics = [
  { label: 'Fatigue', value: '32', unit: '%', color: 'text-state-normal' },
  { label: 'EAR', value: '0.31', unit: '', color: 'text-accent-cyan' },
  { label: 'Speed', value: '64', unit: 'km/h', color: 'text-white/80' },
  { label: 'PERCLOS', value: '8', unit: '%', color: 'text-white/80' },
]

export default function Hero({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated particle grid background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number }[] = []
    const count = 60
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.05,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,${p.alpha})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(6,182,212,${0.06 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrame = requestAnimationFrame(draw)
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="overview" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />

      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-0 dot-grid opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <div className="space-y-8">
            {/* Label badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/55 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Academic Embedded Systems Project · 2025/26
            </div>

            {/* Main heading */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <h1 className="font-display font-black leading-[0.95] tracking-[-0.04em]">
                <span className="block" style={{
                  fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0f9fe 45%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Real-Time Driver
                </span>
                <span className="block" style={{
                  fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                  background: 'linear-gradient(135deg, #ffffff 20%, #bfdbfe 70%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  State Monitoring
                </span>
                <span className="block text-white/30" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  &amp; Emergency Detection System
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-white/45 leading-relaxed max-w-xl animate-slide-up"
              style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              An integrated safety platform combining computer vision fatigue detection with
              embedded crash response, detecting drowsiness before accidents and triggering
              emergency alerts when every second counts.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <button onClick={onOpenDashboard} className="btn-primary-cyan flex items-center gap-2.5">
                <Play className="w-4 h-4" />
                Launch Live Simulation
              </button>
              <button onClick={() => scrollToSection('#architecture')} className="btn-secondary flex items-center gap-2.5">
                Explore Architecture
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 pt-2 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              {techBadges.map((badge) => (
                <span key={badge.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${badge.color}`}>
                  <badge.icon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 pt-2 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
              {[
                { value: '<200ms', label: 'Detection Latency' },
                { value: '24/7', label: 'Real-Time Monitor' },
                { value: '5 Vehs', label: 'Fleet Simulation' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="font-display font-bold text-lg text-white" style={{ letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Integrated HUD Card ── */}
          <div className="relative hidden lg:flex flex-col animate-fade-in -mt-8"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}>

            {/* Ambient glow */}
            <div className="absolute -inset-8 rounded-3xl opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.18) 0%, transparent 70%)' }} />

            <div className="relative animate-float" style={{ animationDuration: '6s' }}>
              {/* ── Main glass card ── */}
              <div className="glass-card-accent p-5 space-y-3">

                {/* Card header row */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-state-emergency animate-pulse-fast" />
                    <span className="text-xs font-mono text-white/50 tracking-widest uppercase">LIVE · CAM-01</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* SOS Ready — fused in header */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-state-emergency/10 border border-state-emergency/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-state-emergency animate-pulse-fast" />
                      <span className="text-[10px] font-mono font-semibold text-state-emergency/90">SOS READY</span>
                    </div>
                    {/* GSM OK — fused in header */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                      <Wifi className="w-3 h-3 text-accent-cyan" />
                      <span className="text-[10px] font-mono font-semibold text-accent-cyan">GSM OK</span>
                    </div>
                    <div className="flex items-center gap-1 ml-1">
                      <Shield className="w-3.5 h-3.5 text-white/20" />
                      <span className="text-[9px] font-mono text-white/20">v1.0</span>
                    </div>
                  </div>
                </div>

                {/* ── Camera feed with REAL photo ── */}
                <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#060a0d]"
                  style={{ aspectRatio: '1/1' }}>

                  {/* Real driver CV image — object-contain shows full image (text + face + wheel) */}
                  <img
                    src="/driver-cv-face.png"
                    alt="Driver monitoring computer vision feed"
                    className="w-full h-full object-contain"
                    style={{ filter: 'brightness(0.95) contrast(1.05)' }}
                  />

                  {/* HUD overlay on top of image */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Laser Sweep Line */}
                    <div className="absolute left-0 w-full h-[2.5px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-laser-sweep z-10" />

                    {/* Scan-line texture */}
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, rgba(6,182,212,0.018) 0px, rgba(6,182,212,0.018) 1px, transparent 1px, transparent 4px)',
                    }} />

                    {/* Corner brackets — HUD style */}
                    {['top-2.5 left-2.5 border-t-2 border-l-2', 'top-2.5 right-2.5 border-t-2 border-r-2',
                      'bottom-2.5 left-2.5 border-b-2 border-l-2', 'bottom-2.5 right-2.5 border-b-2 border-r-2'].map((cls, i) => (
                      <div key={i} className={`absolute w-5 h-5 ${cls} border-cyan-400/50`} />
                    ))}

                    {/* Top-right: REC & Timestamp */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-state-emergency animate-pulse-fast" />
                        <span className="text-[9px] font-mono text-white/50">REC</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                        <span className="text-[9px] font-mono text-white/50">09:03:01</span>
                      </div>
                    </div>

                    {/* Center: 468 landmarks label */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-400/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 tracking-wider">468 LANDMARKS TRACKED</span>
                    </div>

                    {/* Bottom-right: 30 FPS · ACTIVE */}
                    <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-state-normal" />
                      <span className="text-[8px] font-mono text-white/60 tracking-wider">30 FPS · ACTIVE</span>
                    </div>

                    {/* Face detected badge */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-state-normal" />
                      <span className="text-[8px] font-mono text-state-normal/80">FACE DETECTED</span>
                    </div>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-4 gap-2">
                  {metrics.map(m => (
                    <div key={m.label} className="glass-card p-2.5 text-center">
                      <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{m.label}</div>
                      <div className={`text-sm font-bold font-mono ${m.color}`}>
                        {m.value}
                        {m.unit && <span className="text-[9px] text-white/30 ml-0.5">{m.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Status bar — fused inside card ── */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-state-normal/[0.06] border border-state-normal/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-state-normal animate-pulse" />
                    <span className="state-badge state-normal text-[9px] !py-0.5 !px-2">NORMAL</span>
                    <span className="text-xs text-white/40 font-mono">Driver Tesfa A. · VEH-001</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-white/25" />
                    <span className="text-[9px] font-mono text-white/25">9.0301, 38.7613</span>
                  </div>
                </div>

                {/* ── Fleet status strip — fused inside card ── */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-state-normal" />
                    <span className="text-[10px] font-mono text-white/40">5 Vehicles Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'OK', count: 3, color: 'text-state-normal bg-state-normal/10' },
                      { label: 'WARN', count: 1, color: 'text-state-warning bg-state-warning/10' },
                      { label: 'SOS', count: 1, color: 'text-state-emergency bg-state-emergency/10' },
                    ].map(s => (
                      <span key={s.label}
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${s.color}`}>
                        {s.count} {s.label}
                      </span>
                    ))}
                  </div>
                </div>

              </div>{/* end glass card */}
            </div>{/* end animate-float */}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 scroll-indicator">
        <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/25" />
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-white/15" />
      </div>
    </section>
  )
}

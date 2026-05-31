import { Eye, Bell, ArrowDown } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

export default function SolutionSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            The Solution
          </div>
          <h2 className="section-title mb-5 font-display">Two-Tier Safety Strategy</h2>
          <p className="section-subtitle">
            A comprehensive approach combining preventive and reactive safety layers
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4">
            <div className="w-full h-full bg-gradient-to-b from-white/20 via-white/40 to-white/20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center">
                <ArrowDown className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </div>

          {/* Preventive Layer */}
          <RevealSection delay={1} className="glass-card-strong p-8 md:p-10 relative">
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-state-normal/20 border border-state-normal/30 flex items-center justify-center">
              <span className="text-xs font-bold text-state-normal">1</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-state-normal/10 border border-state-normal/20 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-state-normal" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2 tracking-tight">Preventive Layer</h3>
            <span className="text-sm text-state-normal/80 font-medium mb-4 block">Computer Vision Driver Monitoring</span>
            <p className="text-white/40 leading-relaxed mb-6">
              Continuously monitors the driver using a standard webcam and MediaPipe Face Mesh.
              Detects early signs of fatigue, distraction, and micro-sleep before they lead to an accident.
            </p>
            <ul className="space-y-3">
              {[
                'Eye Aspect Ratio (EAR) for blink/closure detection',
                'Mouth Aspect Ratio (MAR) for yawn detection',
                'PERCLOS rolling window analysis',
                'Head pose estimation for distraction',
                'Real-time fatigue score 0-100',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-state-normal/60 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealSection>

          {/* Reactive Layer */}
          <RevealSection delay={2} className="glass-card-strong p-8 md:p-10 relative">
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-state-emergency/20 border border-state-emergency/30 flex items-center justify-center">
              <span className="text-xs font-bold text-state-emergency">2</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-state-emergency/10 border border-state-emergency/20 flex items-center justify-center mb-6">
              <Bell className="w-7 h-7 text-state-emergency" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2 tracking-tight">Reactive Layer</h3>
            <span className="text-sm text-state-emergency/80 font-medium mb-4 block">Embedded Crash Detection & SOS</span>
            <p className="text-white/40 leading-relaxed mb-6">
              When preventive measures are not enough, the ESP32-based embedded system detects crash-like events
              and automatically triggers an emergency response with GPS location and GSM/SMS alerts.
            </p>
            <ul className="space-y-3">
              {[
                'MPU6050 accelerometer/gyroscope impact detection',
                'GPS location tracking with fallback coordinates',
                'State machine: NORMAL → WARNING → ALARM → EMERGENCY',
                'GSM/SMS SOS alert with driver & vehicle details',
                'MUTE/CANCEL button for false alarm prevention',
                'LCD, LEDs, and buzzer for local warnings',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-state-emergency/60 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}

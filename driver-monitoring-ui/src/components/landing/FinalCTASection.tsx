import { Play, ArrowRight, Activity, Shield, Zap } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

const stats = [
  { value: '<200ms', label: 'Detection Latency', icon: Zap },
  { value: '5 States', label: 'Monitored Simultaneously', icon: Activity },
  { value: '100%', label: 'Open Architecture', icon: Shield },
]

export default function FinalCTASection({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Large center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)' }}
        />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <RevealSection>
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan/80 mb-8 font-mono tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            Ready to Launch
          </div>

          {/* Heading */}
          <h2
            className="font-display font-black mb-6 leading-[0.95]"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0f9fe 45%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            See the System<br />Respond in Real Time
          </h2>

          <p className="text-lg text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
            Watch the full system in action — from computer vision fatigue detection
            to embedded crash response and GSM/SOS emergency alerting.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <button
              onClick={onOpenDashboard}
              className="btn-primary-cyan flex items-center gap-2.5 !px-8 !py-4 text-sm"
            >
              <Play className="w-4 h-4" />
              Launch Live Dashboard
            </button>
            <a
              href="#architecture"
              className="btn-secondary flex items-center gap-2.5 px-8 py-4 text-sm"
            >
              View Architecture
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="glass-card p-5 text-center">
                <s.icon className="w-5 h-5 text-accent-cyan/60 mx-auto mb-3" />
                <div className="font-display font-black text-xl text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
                  {s.value}
                </div>
                <div className="text-xs text-white/30 font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  )
}

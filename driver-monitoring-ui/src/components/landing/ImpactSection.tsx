import { Eye, Bell, DollarSign, Layers, Cpu, Award } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

const impacts = [
  { icon: Eye,        title: 'Early Fatigue Detection',   desc: 'Prevents accidents by identifying drowsiness before critical impairment occurs.', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  { icon: Bell,       title: 'Integrated Crash Response', desc: 'Combines prevention and reaction in one unified system, eliminating safety gaps.',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  { icon: DollarSign, title: 'Low-Cost Virtual PoC',      desc: 'Entirely simulated proof of concept demonstrating production-ready architecture without hardware costs.', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { icon: Layers,     title: 'Modular Architecture',      desc: 'Each component independently testable and replaceable — CV module, ESP32 firmware, and sensor layer are decoupled.', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  { icon: Cpu,        title: 'Privacy-Aware Design',      desc: 'All processing happens locally. Raw video is not stored — only anonymized metrics are logged.', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { icon: Award,      title: 'Strong Academic Demo',      desc: 'Comprehensive embedded systems project demonstrating sensor fusion, state machines, and real-time processing.', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
]

export default function ImpactSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.012] to-black" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <RevealSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            Why It Matters
          </div>
          <h2 className="section-title font-display mb-5">Project Impact &amp; Value</h2>
          <p className="section-subtitle">Why this system matters — technically and practically</p>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {impacts.map((item, i) => (
            <RevealSection
              key={item.title}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              threshold={0.1}
            >
              <div className="glass-card p-6 h-full group hover:bg-white/[0.055] transition-all duration-300 cursor-default">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base mb-2 tracking-tight group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-sm text-white/38 leading-relaxed group-hover:text-white/50 transition-colors">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  )
}

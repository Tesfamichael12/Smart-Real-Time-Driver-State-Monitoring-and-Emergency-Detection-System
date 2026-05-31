import { Eye, Bell, DollarSign, Layers, Cpu, Award } from 'lucide-react'

const impacts = [
  { icon: Eye, title: 'Early Fatigue Detection', desc: 'Prevents accidents by identifying drowsiness before critical impairment occurs.' },
  { icon: Bell, title: 'Integrated Crash Response', desc: 'Combines prevention and reaction in one unified system, eliminating safety gaps.' },
  { icon: DollarSign, title: 'Low-Cost Virtual PoC', desc: 'Entirely simulated proof of concept demonstrating production-ready architecture without hardware costs.' },
  { icon: Layers, title: 'Modular Architecture', desc: 'Each component independently testable and replaceable — CV module, ESP32 firmware, and sensor layer are decoupled.' },
  { icon: Cpu, title: 'Privacy-Aware Design', desc: 'All processing happens locally. Raw video is not stored — only anonymized metrics are logged.' },
  { icon: Award, title: 'Strong Academic Demo', desc: 'Comprehensive embedded systems project demonstrating sensor fusion, state machines, and real-time processing.' },
]

export default function ImpactSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Project Impact & Value</h2>
          <p className="section-subtitle">Why this system matters — technically and practically</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {impacts.map((item, i) => (
            <div
              key={item.title}
              className="glass-card p-6 hover:bg-white/[0.05] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-white/60" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

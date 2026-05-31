import { Brain, Clock, AlertTriangle, Unlink } from 'lucide-react'

const problems = [
  {
    icon: Brain,
    title: 'Delayed Reaction Time',
    description: 'Driver fatigue and distraction can reduce reaction time by up to 50%, dramatically increasing the risk of accidents on long journeys.',
  },
  {
    icon: AlertTriangle,
    title: 'Missing Safety Systems',
    description: 'Older and lower-cost vehicles often lack driver monitoring systems, leaving millions of drivers without critical fatigue detection technology.',
  },
  {
    icon: Clock,
    title: 'Delayed Emergency Response',
    description: 'After a crash, injured or unconscious drivers may be unable to call for help. Every minute of delay reduces survival chances significantly.',
  },
  {
    icon: Unlink,
    title: 'Fragmented Solutions',
    description: 'Most existing systems separate drowsiness detection from crash reporting, creating gaps in the safety chain at the most critical moments.',
  },
]

export default function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="section-title mb-4">The Safety Gap</h2>
          <p className="section-subtitle">
            Current systems leave critical gaps in the driver safety chain
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className="glass-card p-8 hover:bg-white/[0.05] transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors">
                <problem.icon className="w-6 h-6 text-white/60" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

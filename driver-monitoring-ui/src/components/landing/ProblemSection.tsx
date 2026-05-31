import { Brain, Clock, AlertTriangle, Unlink } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

const problems = [
  {
    icon: Brain,
    title: 'Delayed Reaction Time',
    description: 'Driver fatigue and distraction reduce reaction time by up to 50%, dramatically increasing accident risk on long journeys.',
    stat: '50%',
    statLabel: 'slower reaction',
    color: 'from-red-500/20 to-transparent',
    border: 'hover:border-red-500/30',
    iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
  {
    icon: AlertTriangle,
    title: 'Missing Safety Systems',
    description: 'Older and lower-cost vehicles lack driver monitoring systems, leaving millions without critical fatigue detection technology.',
    stat: '90%',
    statLabel: 'vehicles unprotected',
    color: 'from-amber-500/20 to-transparent',
    border: 'hover:border-amber-500/30',
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  {
    icon: Clock,
    title: 'Delayed Emergency Response',
    description: 'After a crash, injured drivers may be unable to call for help. Every minute of delay reduces survival chances significantly.',
    stat: '4×',
    statLabel: 'survival with fast response',
    color: 'from-orange-500/20 to-transparent',
    border: 'hover:border-orange-500/30',
    iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  },
  {
    icon: Unlink,
    title: 'Fragmented Solutions',
    description: 'Most existing systems separate drowsiness detection from crash reporting, creating critical gaps in the safety chain.',
    stat: '2-in-1',
    statLabel: 'gap we bridge',
    color: 'from-violet-500/20 to-transparent',
    border: 'hover:border-violet-500/30',
    iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  },
]

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.012] to-black" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <RevealSection className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            The Problem
          </div>
          <h2 className="section-title mb-5 text-gradient">The Safety Gap</h2>
          <p className="section-subtitle mx-auto">
            Current systems leave critical gaps in the driver safety chain —
            gaps our platform is built to close.
          </p>
        </RevealSection>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {problems.map((problem, i) => (
            <RevealSection
              key={problem.title}
              delay={(i + 1) as 1 | 2 | 3 | 4}
              threshold={0.1}
            >
              <div
                className={`relative glass-card p-7 group cursor-default transition-all duration-400 border border-white/[0.06] ${problem.border} overflow-hidden h-full`}
              >
                {/* Gradient accent background */}
                <div
                  className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${problem.color} opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
                />

                <div className="relative">
                  {/* Icon + stat */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${problem.iconBg}`}>
                      <problem.icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-2xl text-white/80" style={{ letterSpacing: '-0.03em' }}>
                        {problem.stat}
                      </div>
                      <div className="text-[10px] text-white/30 font-mono">{problem.statLabel}</div>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg mb-2.5 text-white tracking-tight group-hover:text-white transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed text-sm group-hover:text-white/55 transition-colors">
                    {problem.description}
                  </p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  )
}

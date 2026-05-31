import { Shield, Users } from 'lucide-react'

const team = [
  { name: 'Tesfamichael T.', role: 'Firmware / State Machine', initials: 'TT', color: 'from-cyan-400/20 to-violet-400/20' },
  { name: 'Tewodros G.', role: 'Computer Vision', initials: 'TG', color: 'from-violet-400/20 to-amber-400/20' },
  { name: 'Thressa M.', role: 'Hardware Simulation', initials: 'TM', color: 'from-amber-400/20 to-state-normal/20' },
  { name: 'Tigist K.', role: 'GPS / GSM Communication', initials: 'TK', color: 'from-state-normal/20 to-cyan-400/20' },
]

export default function TeamSection() {
  return (
    <section id="team" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-6">
            <Shield className="w-4 h-4" />
            Addis Ababa Science and Technology University
          </div>
          <h2 className="section-title mb-3">Project Team</h2>
          <p className="text-white/40 max-w-xl mx-auto">
            College of Engineering · Department of Software Engineering · Embedded Systems · 2025/26
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member, i) => (
            <div
              key={member.name}
              className="glass-card p-6 w-48 text-center hover:bg-white/[0.05] transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}>
                <span className="text-lg font-bold text-white/80">{member.initials}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{member.name}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{member.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="glass-card inline-flex items-center gap-3 px-6 py-4">
            <Users className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/50">
              <strong className="text-white/80">Smart Real-Time Driver State Monitoring</strong> and Emergency Detection System
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

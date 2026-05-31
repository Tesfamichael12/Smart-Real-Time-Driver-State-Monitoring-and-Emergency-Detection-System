import { Shield, Github, Linkedin, Mail, Cpu, Brain, Laptop, Terminal, Eye } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

interface TeamMember {
  name: string
  role: string
  initials: string
  color: string
  icon: any
  tag: string
  skills: string[]
  socials?: {
    github?: string
    linkedin?: string
    email?: string
  }
}

const team: TeamMember[] = [
  {
    name: 'Tesfamichael T.',
    role: 'Technical Lead & Embedded Systems Engineer',
    initials: 'TT',
    color: 'from-amber-500/10 to-orange-500/10 hover:border-amber-500/30',
    icon: Brain,
    tag: 'TECH LEAD',
    skills: ['System Architecture', 'Firmware (C++)', 'Computer Vision', 'React UI'],
    socials: {
      github: 'https://github.com/Tesfamichael12',
      linkedin: 'https://www.linkedin.com/in/tesfamichael-tafere/',
      email: 'mailto:tesfamichael132@gmail.com'
    }
  },
  {
    name: 'Tewodros G.',
    role: 'Computer Vision Specialist',
    initials: 'TG',
    color: 'from-cyan-500/10 to-blue-500/10 hover:border-cyan-500/30',
    icon: Eye,
    tag: 'AI / CV',
    skills: ['OpenCV', 'MediaPipe', 'Python', 'Landmark Analysis']
  },
  {
    name: 'Thressa M.',
    role: 'Hardware Simulation Lead',
    initials: 'TM',
    color: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/30',
    icon: Laptop,
    tag: 'SIMULATION',
    skills: ['Wokwi', 'MPU6050', 'Fritzing', 'Prototyping']
  },
  {
    name: 'Tigist K.',
    role: 'GPS & Telemetry Architect',
    initials: 'TK',
    color: 'from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/30',
    icon: Terminal,
    tag: 'COMMS',
    skills: ['NEO-6M GPS', 'SIM800L GSM', 'AT Commands', 'API Sync']
  }
]

export default function TeamSection() {
  return (
    <section id="team" className="relative py-24 md:py-32 bg-black border-t border-white/[0.02]">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <RevealSection className="text-center mb-20">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Addis Ababa Science and Technology University
          </div>
          <h2 className="section-title font-display mb-5">Engineering Team</h2>
          <p className="section-subtitle">
            College of Engineering · Department of Software Engineering · Embedded Systems Project
          </p>
        </RevealSection>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => {
            const MemberIcon = member.icon
            return (
              <RevealSection
                key={member.name}
                className={`glass-card p-6 flex flex-col items-center text-center transition-all duration-300 group hover:-translate-y-1.5 bg-gradient-to-b ${member.color}`}
              >
                {/* Profile Circle with Initials & Role Icon badge */}
                <div className="relative w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/[0.06] group-hover:scale-105 transition-all duration-350">
                  <span className="text-2xl font-black font-display text-white/90 group-hover:text-cyan-400 transition-colors">
                    {member.initials}
                  </span>
                  
                  {/* Small absolute icon badge */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-6.5 h-6.5 rounded-lg bg-black border border-white/15 flex items-center justify-center shadow-lg">
                    <MemberIcon className="w-3.5 h-3.5 text-white/50" />
                  </div>
                </div>

                {/* Tag Badge */}
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold tracking-widest text-white/40 mb-3">
                  {member.tag}
                </span>

                {/* Name & Role */}
                <h3 className="text-sm font-bold font-display tracking-tight text-white/80 group-hover:text-white transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs text-white/40 mt-1 min-h-[32px] leading-relaxed px-2">
                  {member.role}
                </p>

                {/* Skill Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4 pt-4 border-t border-white/[0.05] w-full">
                  {member.skills.map(s => (
                    <span 
                      key={s} 
                      className="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.06] text-[8.5px] font-mono text-white/50"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2.5 mt-5 text-white/20 group-hover:text-white/40 transition-colors">
                  {member.socials?.github ? (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub Profile">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="opacity-30 cursor-not-allowed">
                      <Github className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {member.socials?.linkedin ? (
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn Profile">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="opacity-30 cursor-not-allowed">
                      <Linkedin className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {member.socials?.email ? (
                    <a href={member.socials.email} className="hover:text-white transition-colors" aria-label="Contact Email">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="opacity-30 cursor-not-allowed">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

              </RevealSection>
            )
          })}
        </div>

        {/* Footer Project Tag */}
        <RevealSection className="mt-16 text-center">
          <div className="glass-card inline-flex items-center gap-3 px-6 py-4 border border-white/5 bg-white/[0.01]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-fast" />
            <span className="text-xs text-white/55 font-mono">
              Academic Term Project · Under Instruction of AASTU Software Engineering Faculty
            </span>
          </div>
        </RevealSection>

      </div>
    </section>
  )
}

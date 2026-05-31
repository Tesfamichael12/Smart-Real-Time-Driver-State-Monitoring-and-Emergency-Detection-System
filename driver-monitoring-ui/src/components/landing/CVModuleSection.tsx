import { Eye, MessageSquare, Clock, Activity, Brain, Camera, AlertTriangle, Gauge } from 'lucide-react'

const features = [
  { icon: Eye, title: 'EAR Detection', desc: 'Eye Aspect Ratio measures eyelid closure with precision. Threshold-based blink and drowsiness detection.', color: 'text-cyan-400' },
  { icon: MessageSquare, title: 'MAR / Yawn Detection', desc: 'Mouth Aspect Ratio identifies yawning events as a key indicator of driver fatigue.', color: 'text-cyan-400' },
  { icon: Clock, title: 'PERCLOS Analysis', desc: 'Percentage of eyelid closure over a rolling time window. Industry-standard drowsiness metric.', color: 'text-violet-400' },
  { icon: Activity, title: 'Blink Rate Monitoring', desc: 'Tracks blink frequency per minute. Abnormal patterns indicate micro-sleep or extreme fatigue.', color: 'text-violet-400' },
  { icon: Brain, title: 'Micro-Sleep Detection', desc: 'Identifies sustained eye closure events >0.5 seconds — a critical sign of involuntary sleep onset.', color: 'text-state-emergency' },
  { icon: Camera, title: 'Head Pose Estimation', desc: 'solvePnP-based 6-DOF head tracking detects distraction, nodding, and loss of attention.', color: 'text-violet-400' },
  { icon: AlertTriangle, title: 'Face Lost Detection', desc: 'Detects when the driver\'s face leaves the frame or the camera is obstructed or disabled.', color: 'text-state-warning' },
  { icon: Gauge, title: 'Fatigue Score 0-100', desc: 'Weighted composite score combining all metrics into a single actionable value for the state machine.', color: 'text-violet-400' },
]

export default function CVModuleSection() {
  return (
    <section id="cv-module" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Computer Vision Module</h2>
          <p className="section-subtitle">
            MediaPipe Face Mesh-powered driver monitoring with 8 distinct detection capabilities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="glass-card p-5 hover:bg-white/[0.05] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors`}>
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feat.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Mock Live Camera */}
          <div className="glass-card-strong p-5 animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-state-normal animate-pulse" />
                <span className="text-sm font-medium">Live Feed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/30">MediaPipe Face Mesh</span>
                <div className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-white/40">30 FPS</div>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative aspect-video rounded-xl bg-black/80 border border-white/10 overflow-hidden">
              {/* Face mesh overlay */}
              <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                {/* Face outline */}
                <ellipse cx="200" cy="150" rx="90" ry="110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Face mesh dots */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={120 + Math.random() * 160}
                    cy={70 + Math.random() * 160}
                    r="1.5"
                    fill="rgba(34, 211, 238, 0.4)"
                  />
                ))}
                {/* Eye landmarks */}
                <ellipse cx="160" cy="130" rx="18" ry="6" fill="none" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1.5" />
                <ellipse cx="240" cy="130" rx="18" ry="6" fill="none" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1.5" />
                {/* Mouth */}
                <path d="M 175 185 Q 200 195 225 185" fill="none" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1.5" />
                {/* Nose */}
                <line x1="200" y1="145" x2="200" y2="170" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" />
                {/* Grid lines */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`g${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" stroke="rgba(255,255,255,0.02)" />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="rgba(255,255,255,0.02)" />
                ))}
              </svg>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-white/20" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-white/20" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-white/20" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-white/20" />
            </div>

            {/* Metric overlay */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'EAR', value: '0.31' },
                { label: 'MAR', value: '0.18' },
                { label: 'PERCLOS', value: '8.2%' },
                { label: 'Blink', value: '14/min' },
              ].map(m => (
                <div key={m.label} className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</div>
                  <div className="text-sm font-bold font-mono text-cyan-400">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-state-normal" />
                Face detected · Tracking 468 landmarks
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

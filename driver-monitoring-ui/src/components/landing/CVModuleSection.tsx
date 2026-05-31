import { useState } from 'react'
import { Eye, MessageSquare, Clock, Activity, Brain, Camera, AlertTriangle, Gauge } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

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

interface TabConfig {
  id: string
  label: string
  ear: string
  mar: string
  perclos: string
  blinkRate: string
  pose: string
  description: string
  state: 'NORMAL' | 'WARNING' | 'ALARM' | 'EMERGENCY'
  eyeRy: number
  mouthPath: string
  headOffset: string
}

const tabs: TabConfig[] = [
  {
    id: 'normal',
    label: 'Normal driving',
    ear: '0.35',
    mar: '0.12',
    perclos: '4.2%',
    blinkRate: '12/min',
    pose: 'Yaw: 2°, Pitch: -1°',
    description: 'Driver is alert, face fully detected, and focus remains on the road ahead.',
    state: 'NORMAL',
    eyeRy: 8,
    mouthPath: 'M 175 185 Q 200 195 225 185',
    headOffset: 'translate(0, 0)',
  },
  {
    id: 'microsleep',
    label: 'Micro-Sleep Event',
    ear: '0.12',
    mar: '0.14',
    perclos: '32.4%',
    blinkRate: '3/min',
    pose: 'Yaw: 0°, Pitch: -14°',
    description: 'Critical warning! Eyelids are closed for >0.5s with head nodding downwards.',
    state: 'ALARM',
    eyeRy: 1.5,
    mouthPath: 'M 175 185 Q 200 190 225 185',
    headOffset: 'translate(0, 15px)',
  },
  {
    id: 'yawning',
    label: 'Yawning Fatigue',
    ear: '0.32',
    mar: '0.45',
    perclos: '9.5%',
    blinkRate: '15/min',
    pose: 'Yaw: 1°, Pitch: 3°',
    description: 'High fatigue indicator. Mouth aspect ratio (MAR) is expanded for >2.0s.',
    state: 'WARNING',
    eyeRy: 4,
    mouthPath: 'M 180 180 Q 200 215 220 180 Q 200 170 180 180',
    headOffset: 'translate(0, -3px)',
  },
  {
    id: 'distraction',
    label: 'Driver Distracted',
    ear: '0.34',
    mar: '0.11',
    perclos: '6.1%',
    blinkRate: '11/min',
    pose: 'Yaw: -32°, Pitch: -4°',
    description: 'Attention lost. Head pose yaw shifted away from center path for >1.5s.',
    state: 'WARNING',
    eyeRy: 8,
    mouthPath: 'M 175 185 Q 200 192 225 185',
    headOffset: 'translate(-28px, 0) scale(0.95, 1)',
  },
]

export default function CVModuleSection() {
  const [activeTab, setActiveTab] = useState('normal')
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <section id="cv-module" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            AI Detection Layer
          </div>
          <h2 className="section-title font-display mb-5">Computer Vision Module</h2>
          <p className="section-subtitle">
            MediaPipe Face Mesh-powered driver monitoring with real-time facial landmark analytics
          </p>
        </RevealSection>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
                activeTab === t.id
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Features (5 Cols) */}
          <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="glass-card p-5 hover:bg-white/[0.05] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors`}>
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="font-display text-sm font-bold mb-1.5 tracking-tight">{feat.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* COLUMN 2: Mock Live Camera with Interactive Landmarks (4 Cols) */}
          <div className="lg:col-span-4 glass-card-strong p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  currentTab.state === 'ALARM' ? 'bg-state-alarm animate-pulse-fast' :
                  currentTab.state === 'WARNING' ? 'bg-state-warning animate-pulse' : 'bg-state-normal'
                }`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Live CV Feed</span>
              </div>
              <div className="px-2.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-cyan-400">
                ACTIVE STATE: {currentTab.state}
              </div>
            </div>

            {/* Camera View Box */}
            <div className="relative aspect-video rounded-xl bg-[#03070a] border border-white/10 overflow-hidden">
              
              {/* Animated Face mesh overlay */}
              <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                
                {/* HUD Scan sweeps */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1.5" className="animate-pulse" />

                {/* Animated Head mesh group based on selection */}
                <g transform={currentTab.headOffset} className="transition-transform duration-500 origin-center">
                  {/* Face outline */}
                  <ellipse cx="200" cy="140" rx="75" ry="95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  
                  {/* Face mesh network dot array (simulated nodes) */}
                  <circle cx="200" cy="70" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="200" cy="90" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="170" cy="95" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="230" cy="95" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="150" cy="120" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="250" cy="120" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="140" cy="150" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="260" cy="150" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="160" cy="180" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="240" cy="180" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
                  <circle cx="200" cy="220" r="1.5" fill="rgba(34, 211, 238, 0.5)" />

                  {/* Left Eye */}
                  <ellipse cx="170" cy="125" rx="14" ry={currentTab.eyeRy} fill="none" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1.5" className="transition-all duration-500" />
                  <circle cx="170" cy="125" r="3" fill="rgba(34, 211, 238, 0.7)" className="transition-all duration-500" style={{ opacity: currentTab.eyeRy > 2 ? 1 : 0 }} />

                  {/* Right Eye */}
                  <ellipse cx="230" cy="125" rx="14" ry={currentTab.eyeRy} fill="none" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1.5" className="transition-all duration-500" />
                  <circle cx="230" cy="125" r="3" fill="rgba(34, 211, 238, 0.7)" className="transition-all duration-500" style={{ opacity: currentTab.eyeRy > 2 ? 1 : 0 }} />

                  {/* Nose */}
                  <line x1="200" y1="125" x2="200" y2="160" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1.5" />
                  <line x1="195" y1="160" x2="205" y2="160" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1.5" />

                  {/* Mouth Shape (Yawning vs Normal) */}
                  <path d={currentTab.mouthPath} fill="none" stroke="rgba(168, 85, 247, 0.8)" strokeWidth="2" className="transition-all duration-500" />
                </g>

                {/* Grid Lines */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`g${i}`} x1={i * 80} y1="0" x2={i * 80} y2="300" stroke="rgba(255,255,255,0.015)" />
                ))}
              </svg>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-white/20" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-white/20" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-white/20" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-white/20" />
              
              {/* Tab description overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-2 rounded-lg border border-white/5 text-[10px] text-white/60">
                {currentTab.description}
              </div>
            </div>

            {/* Dynamic Metric displays */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">EAR (Eyes)</span>
                <span className={`text-base font-bold font-mono ${Number(currentTab.ear) < 0.2 ? 'text-state-alarm animate-pulse' : 'text-cyan-400'}`}>{currentTab.ear}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">MAR (Mouth)</span>
                <span className={`text-base font-bold font-mono ${Number(currentTab.mar) > 0.3 ? 'text-state-warning animate-pulse' : 'text-violet-400'}`}>{currentTab.mar}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">PERCLOS</span>
                <span className={`text-base font-bold font-mono ${currentTab.state === 'ALARM' ? 'text-state-alarm' : 'text-white/80'}`}>{currentTab.perclos}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">Head Pose</span>
                <span className="text-[11px] font-bold font-mono text-white/60 leading-tight">{currentTab.pose}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: High-Fidelity Graphics Display (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card-strong p-4 relative overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">CV Parameter Graph</h4>
              <div className="relative aspect-square rounded-lg border border-white/5 overflow-hidden">
                <img 
                  src="/driver_fatigue_detection.png" 
                  alt="Driver fatigue detection parameters graph UI visualization" 
                  className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.1]"
                />
              </div>
              <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
                Dual comparison logs tracking facial mesh landmarks to compute continuous EAR/MAR rates.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

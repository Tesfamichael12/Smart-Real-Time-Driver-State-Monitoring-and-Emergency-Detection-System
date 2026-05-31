import { useState } from 'react'
import { cn } from '../../lib/utils'

interface StateDef {
  id: string
  label: string
  description: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
}

const states: StateDef[] = [
  { id: 'NORMAL', label: 'NORMAL', description: 'Driver alert, all metrics within safe range. Green LED heartbeat.', color: '#22c55e', bgClass: 'bg-state-normal/10', borderClass: 'border-state-normal/30', textClass: 'text-state-normal' },
  { id: 'WARNING', label: 'WARNING', description: 'Fatigue ≥ 75 or sensor threshold crossed. Yellow LED + intermittent buzzer.', color: '#eab308', bgClass: 'bg-state-warning/10', borderClass: 'border-state-warning/30', textClass: 'text-state-warning' },
  { id: 'ALARM', label: 'ALARM', description: 'Fatigue ≥ 85 or critical sensor reading. Red LED flashing + rapid buzzer.', color: '#f97316', bgClass: 'bg-state-alarm/10', borderClass: 'border-state-alarm/30', textClass: 'text-state-alarm' },
  { id: 'EMERGENCY', label: 'EMERGENCY', description: 'Crash detected or fatigue ≥ 90 sustained. SOS countdown + siren + emergency LED.', color: '#ef4444', bgClass: 'bg-state-emergency/10', borderClass: 'border-state-emergency/30', textClass: 'text-state-emergency' },
  { id: 'MUTED', label: 'MUTED', description: 'Cancel button pressed. Alerts silenced. Auto-returns to NORMAL when safe.', color: '#6b7280', bgClass: 'bg-state-muted/10', borderClass: 'border-state-muted/30', textClass: 'text-state-muted' },
]

const transitions = [
  { from: 'NORMAL', to: 'WARNING', label: 'Fatigue ≥ 75', color: '#eab308' },
  { from: 'WARNING', to: 'ALARM', label: 'Fatigue ≥ 85', color: '#f97316' },
  { from: 'ALARM', to: 'EMERGENCY', label: 'Fatigue ≥ 90 sustained', color: '#ef4444' },
  { from: 'WARNING', to: 'EMERGENCY', label: 'Crash impact', color: '#ef4444' },
  { from: 'ALARM', to: 'EMERGENCY', label: 'Crash impact', color: '#ef4444' },
  { from: 'EMERGENCY', to: 'MUTED', label: 'Cancel pressed', color: '#6b7280' },
  { from: 'ALARM', to: 'MUTED', label: 'Cancel pressed', color: '#6b7280' },
  { from: 'WARNING', to: 'MUTED', label: 'Cancel pressed', color: '#6b7280' },
  { from: 'MUTED', to: 'NORMAL', label: 'Safe baseline', color: '#22c55e' },
  { from: 'ALARM', to: 'WARNING', label: 'Fatigue drops', color: '#eab308' },
  { from: 'WARNING', to: 'NORMAL', label: 'Fatigue < 75', color: '#22c55e' },
]

export default function StateMachineSection() {
  const [activeState, setActiveState] = useState<string | null>(null)

  const relatedTransitions = transitions.filter(
    t => t.from === activeState || t.to === activeState
  )

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">System State Machine</h2>
          <p className="section-subtitle">
            Five-state alert system with configurable thresholds and automatic transitions
          </p>
        </div>

        {/* State Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {states.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveState(activeState === s.id ? null : s.id)}
              className={cn(
                `p-5 rounded-xl border transition-all duration-300 animate-fade-in`,
                activeState === s.id
                  ? `${s.bgClass} ${s.borderClass} scale-105 shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={cn('w-4 h-4 rounded-full', activeState === s.id ? 'animate-pulse-fast' : '')} style={{ backgroundColor: s.color }} />
                <span className={cn('text-sm font-bold', s.textClass)}>{s.label}</span>
                <span className="text-[10px] text-white/30 leading-relaxed">{s.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Transitions for active state */}
        {activeState && (
          <div className="glass-card-strong p-6 animate-slide-up mb-8">
            <h3 className="text-sm font-semibold mb-4">
              Transitions for <span className={states.find(s => s.id === activeState)?.textClass}>{activeState}</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedTransitions.length > 0 ? relatedTransitions.map(t => (
                <div key={`${t.from}-${t.to}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded', states.find(s => s.id === t.from)?.bgClass, states.find(s => s.id === t.from)?.textClass)}>
                    {t.from}
                  </span>
                  <div className="flex items-center gap-1.5 text-white/30">
                    <span>→</span>
                    <span className="text-[10px] text-white/40">{t.label}</span>
                  </div>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded', states.find(s => s.id === t.to)?.bgClass, states.find(s => s.id === t.to)?.textClass)}>
                    {t.to}
                  </span>
                </div>
              )) : (
                <span className="text-xs text-white/30">No specific transitions from this state</span>
              )}
            </div>
          </div>
        )}

        {/* Threshold Legend */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-3">Configuration Thresholds</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-white/30 block mb-2">Fatigue Score</span>
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-white/40">Warning ≥</span><span className="font-mono text-state-warning">75</span></div>
                <div className="flex justify-between"><span className="text-white/40">Alarm ≥</span><span className="font-mono text-state-alarm">85</span></div>
                <div className="flex justify-between"><span className="text-white/40">Critical ≥</span><span className="font-mono text-state-emergency">90</span></div>
              </div>
            </div>
            <div>
              <span className="text-white/30 block mb-2">Acceleration (G-force)</span>
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-white/40">Warning ≥</span><span className="font-mono text-state-warning">1.6 G</span></div>
                <div className="flex justify-between"><span className="text-white/40">Alarm ≥</span><span className="font-mono text-state-alarm">2.2 G</span></div>
                <div className="flex justify-between"><span className="text-white/40">Crash ≥</span><span className="font-mono text-state-emergency">3.0 G</span></div>
              </div>
            </div>
            <div>
              <span className="text-white/30 block mb-2">Timing</span>
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-white/40">SOS cancel window</span><span className="font-mono text-white/60">8 seconds</span></div>
                <div className="flex justify-between"><span className="text-white/40">Fatigue escalation</span><span className="font-mono text-white/60">10 seconds</span></div>
                <div className="flex justify-between"><span className="text-white/40">Crash confirm count</span><span className="font-mono text-white/60">2 reads</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

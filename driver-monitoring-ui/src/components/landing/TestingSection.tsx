import { CheckCircle, XCircle } from 'lucide-react'

const tests = [
  { name: 'Normal Driving', desc: 'System remains in NORMAL state with green LED heartbeat', result: 'pass' as const },
  { name: 'Fatigue Warning', desc: 'Fatigue ≥ 75 triggers WARNING state with yellow LED and buzzer', result: 'pass' as const },
  { name: 'Fatigue Alarm', desc: 'Fatigue ≥ 85 triggers ALARM state with flashing red LED', result: 'pass' as const },
  { name: 'Critical Fatigue Escalation', desc: 'Fatigue ≥ 90 sustained for 10s escalates to EMERGENCY', result: 'pass' as const },
  { name: 'Crash Test Button', desc: 'Manual crash button triggers EMERGENCY state instantly', result: 'pass' as const },
  { name: 'GPS/SOS Message', desc: 'SOS sent via simulated GSM with full telemetry and location', result: 'pass' as const },
  { name: 'Face Lost / Camera Blocked', desc: 'Face loss >5s triggers WARNING, >10s CAMERA_LOST state', result: 'pass' as const },
  { name: 'Mute / Cancel False Alarm', desc: 'Cancel button mutes alerts and cancels pending SOS', result: 'pass' as const },
  { name: 'State Machine Transitions', desc: 'All 5 states with correct transition logic verified', result: 'pass' as const },
  { name: 'End-to-End Integration', desc: 'CV → ESP32 → MPU6050 → GPS → GSM pipeline functional', result: 'pass' as const },
]

export default function TestingSection() {
  return (
    <section id="testing" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Testing & Evaluation</h2>
          <p className="section-subtitle">Comprehensive testing validates every component and integration point</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test, i) => (
            <div
              key={test.name}
              className="glass-card p-5 hover:bg-white/[0.05] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${test.result === 'pass' ? 'bg-state-normal/10' : 'bg-state-emergency/10'}`}>
                  {test.result === 'pass'
                    ? <CheckCircle className="w-4 h-4 text-state-normal" />
                    : <XCircle className="w-4 h-4 text-state-emergency" />
                  }
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${test.result === 'pass' ? 'bg-state-normal/10 text-state-normal' : 'bg-state-emergency/10 text-state-emergency'}`}>
                  {test.result === 'pass' ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{test.name}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{test.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

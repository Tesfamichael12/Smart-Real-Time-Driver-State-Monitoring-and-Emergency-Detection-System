import { Cpu, Gauge, MapPin, Wifi, Monitor, Bell, Volume2, ShieldOff } from 'lucide-react'

const components = [
  { icon: Cpu, title: 'ESP32 Controller', desc: 'Dual-core microcontroller managing the state machine, sensor fusion, and communication.', color: 'text-amber-400' },
  { icon: Gauge, title: 'MPU6050', desc: '6-axis accelerometer + gyroscope for crash detection and motion sensing.', color: 'text-amber-400' },
  { icon: MapPin, title: 'GPS Module', desc: 'NEO-6M GPS providing live coordinates with demo fallback location.', color: 'text-state-normal' },
  { icon: Wifi, title: 'GSM/SMS Simulator', desc: 'Simulated AT-command-based SMS alert with full emergency payload.', color: 'text-state-emergency' },
  { icon: Monitor, title: '16x2 LCD Display', desc: 'Shows real-time status, fatigue percentage, speed, and GPS data.', color: 'text-state-warning' },
  { icon: Bell, title: 'Alert LEDs', desc: 'Green (normal), Yellow (warning), Red (alarm) + flashing emergency LED.', color: 'text-state-warning' },
  { icon: Volume2, title: 'Buzzer', desc: 'Audio alerts with escalating frequency based on severity level.', color: 'text-state-warning' },
  { icon: ShieldOff, title: 'Cancel Button', desc: 'Mutes alerts and cancels pending SOS within the 8-second window.', color: 'text-white/50' },
]

export default function EmbeddedSection() {
  return (
    <section id="embedded" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Embedded Emergency System</h2>
          <p className="section-subtitle">
            ESP32-based hardware system with MPU6050, GPS, and GSM/SOS simulation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Component Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {components.map((comp, i) => (
              <div
                key={comp.title}
                className="glass-card p-5 hover:bg-white/[0.05] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-white/10`}>
                  <comp.icon className={`w-5 h-5 ${comp.color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{comp.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{comp.desc}</p>
              </div>
            ))}
          </div>

          {/* Hardware Visual */}
          <div className="glass-card-strong p-6 animate-fade-in animate-delay-300">
            <div className="flex items-center gap-2 mb-5">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold">Wokwi Circuit Diagram</span>
            </div>

            {/* Simulated circuit visualization */}
            <div className="relative aspect-square rounded-xl bg-black/60 border border-white/10 overflow-hidden p-4">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* ESP32 */}
                <rect x="140" y="20" width="120" height="70" rx="8" fill="rgba(251, 146, 60, 0.15)" stroke="rgba(251, 146, 60, 0.4)" strokeWidth="1.5" />
                <text x="200" y="60" textAnchor="middle" fill="rgba(251, 146, 60, 0.8)" fontSize="11" fontFamily="monospace">ESP32</text>

                {/* MPU6050 */}
                <rect x="30" y="160" width="90" height="60" rx="6" fill="rgba(251, 146, 60, 0.1)" stroke="rgba(251, 146, 60, 0.3)" strokeWidth="1" />
                <text x="75" y="197" textAnchor="middle" fill="rgba(251, 146, 60, 0.6)" fontSize="9" fontFamily="monospace">MPU6050</text>

                {/* GPS */}
                <rect x="30" y="260" width="90" height="60" rx="6" fill="rgba(34, 197, 94, 0.1)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1" />
                <text x="75" y="297" textAnchor="middle" fill="rgba(34, 197, 94, 0.6)" fontSize="9" fontFamily="monospace">GPS NEO-6M</text>

                {/* LCD */}
                <rect x="200" y="130" width="160" height="70" rx="6" fill="rgba(234, 179, 8, 0.1)" stroke="rgba(234, 179, 8, 0.3)" strokeWidth="1" />
                <text x="280" y="162" textAnchor="middle" fill="rgba(234, 179, 8, 0.6)" fontSize="8" fontFamily="monospace">16x2 LCD</text>
                <text x="280" y="178" textAnchor="middle" fill="rgba(234, 179, 8, 0.4)" fontSize="7" fontFamily="monospace">STATUS: NORMAL</text>

                {/* LEDs */}
                <circle cx="220" cy="260" r="12" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" />
                <circle cx="260" cy="260" r="12" fill="rgba(234, 179, 8, 0.2)" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="1" />
                <circle cx="300" cy="260" r="12" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1" />

                {/* Buzzer */}
                <rect x="230" y="310" width="100" height="50" rx="25" fill="rgba(234, 179, 8, 0.1)" stroke="rgba(234, 179, 8, 0.3)" strokeWidth="1" />
                <text x="280" y="340" textAnchor="middle" fill="rgba(234, 179, 8, 0.6)" fontSize="8" fontFamily="monospace">BUZZER</text>

                {/* Connections */}
                <line x1="200" y1="90" x2="200" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="140" y1="55" x2="120" y2="190" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="120" y1="195" x2="120" y2="290" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="200" y1="200" x2="220" y2="248" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="280" y1="200" x2="280" y2="310" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Potentiometer */}
                <rect x="30" y="40" width="70" height="80" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="65" y="65" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">POT</text>
                <text x="65" y="80" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">Fatigue</text>
                <text x="65" y="100" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace">42%</text>
                <line x1="100" y1="80" x2="140" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </svg>
            </div>

            {/* Pinout info */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { pin: 'GPIO 4', label: 'LED OK (Green)' },
                { pin: 'GPIO 25', label: 'LED WARN (Yellow)' },
                { pin: 'GPIO 26', label: 'LED ALARM (Red)' },
                { pin: 'GPIO 27', label: 'LED EMERG (Flash)' },
                { pin: 'GPIO 33', label: 'Buzzer' },
                { pin: 'GPIO 32', label: 'Cancel Button' },
                { pin: 'GPIO 14', label: 'Crash Button' },
                { pin: 'GPIO 34', label: 'Potentiometer' },
              ].map(p => (
                <div key={p.pin} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-white/30 w-12">{p.pin}</span>
                  <span className="text-white/40">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Play, Activity, MapPin, Gauge, Bell, Volume2, VolumeX, AlertTriangle, ShieldCheck, Mail } from 'lucide-react'

interface LogEntry {
  msg: string
  time: string
  type: 'info' | 'warning' | 'alarm' | 'emergency'
}

export default function DemoPreview({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [drowsiness, setDrowsiness] = useState(32)
  const [gForce, setGForce] = useState(1.02)
  const [speed, setSpeed] = useState(64)
  const [isAudioMuted, setIsAudioMuted] = useState(true)
  const [sosCountdown, setSosCountdown] = useState(8)
  const [sosSent, setSosSent] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    { msg: 'System online · All sensors OK', time: '00:32', type: 'info' },
    { msg: 'CV module initialized', time: '00:32', type: 'info' },
    { msg: 'ESP32 telemetry active', time: '00:31', type: 'info' },
  ])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Determine State
  let systemState: 'NORMAL' | 'WARNING' | 'ALARM' | 'EMERGENCY' = 'NORMAL'
  if (gForce >= 3.0) {
    systemState = 'EMERGENCY'
  } else if (drowsiness >= 80) {
    systemState = 'ALARM'
  } else if (drowsiness >= 60) {
    systemState = 'WARNING'
  }

  // Handle state logs
  const lastState = useRef(systemState)
  useEffect(() => {
    if (systemState !== lastState.current) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      let msg = ''
      let type: LogEntry['type'] = 'info'

      if (systemState === 'NORMAL') {
        msg = 'Driver state normalized · Monitoring active'
        type = 'info'
      } else if (systemState === 'WARNING') {
        msg = `WARNING: Driver drowsiness threshold exceeded (${drowsiness}%)`
        type = 'warning'
      } else if (systemState === 'ALARM') {
        msg = `ALARM: Critical micro-sleep / yawn detected (${drowsiness}%)`
        type = 'alarm'
      } else if (systemState === 'EMERGENCY') {
        msg = `EMERGENCY: Impact detected! G-Force: ${gForce}G. Countdown initiated.`
        type = 'emergency'
      }

      setLog(prev => [{ msg, time, type }, ...prev].slice(0, 15))
      lastState.current = systemState
    }
  }, [systemState, drowsiness, gForce])

  // Handle countdown & SMS send for emergency state
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (systemState === 'EMERGENCY') {
      if (sosCountdown > 0) {
        timer = setInterval(() => {
          setSosCountdown(prev => prev - 1)
        }, 1000)
      } else if (!sosSent) {
        setSosSent(true)
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLog(prev => [
          { msg: 'SOS Alert: GPS & telemetry SMS sent to primary contacts', time, type: 'emergency' },
          ...prev
        ])
      }
    } else {
      setSosCountdown(8)
      setSosSent(false)
    }

    return () => clearInterval(timer)
  }, [systemState, sosCountdown, sosSent])

  // Synthesize warning tones based on alert status
  useEffect(() => {
    // Clear previous audio intervals
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current)
      audioIntervalRef.current = null
    }

    if (isAudioMuted || systemState === 'NORMAL') return

    // Initialize AudioContext on user interaction
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioCtx = audioCtxRef.current

    const playBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
      try {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume()
        }
        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration - 0.05)

        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + duration)
      } catch (e) {
        console.error('Audio synthesis failed', e)
      }
    }

    // Set buzzer/alert interval according to severity
    if (systemState === 'WARNING') {
      // Soft single beep every 1.5 seconds
      audioIntervalRef.current = setInterval(() => {
        playBeep(880, 0.15)
      }, 1500)
    } else if (systemState === 'ALARM') {
      // Urgent double beep every 0.8 seconds
      audioIntervalRef.current = setInterval(() => {
        playBeep(1200, 0.1, 'sawtooth')
        setTimeout(() => playBeep(1200, 0.1, 'sawtooth'), 150)
      }, 800)
    } else if (systemState === 'EMERGENCY') {
      // Continuous high-pitch siren alarm
      audioIntervalRef.current = setInterval(() => {
        playBeep(1600, 0.25, 'triangle')
        setTimeout(() => playBeep(1300, 0.25, 'triangle'), 250)
      }, 500)
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current)
    }
  }, [systemState, isAudioMuted])

  const toggleAudio = () => {
    setIsAudioMuted(prev => !prev)
    // Initial resume of context on first click
    if (isAudioMuted && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  // Cancel Emergency Mode
  const cancelEmergency = () => {
    setGForce(1.02)
    setSosCountdown(8)
    setSosSent(false)
  }

  return (
    <section id="demo" className="relative py-24 md:py-32 bg-black overflow-hidden dot-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            Interactive Showcase
          </div>
          <h2 className="section-title font-display mb-4">Interactive System Playground</h2>
          <p className="section-subtitle">
            Simulate fatigue spikes or crash force impacts and observe real-time ESP32 warning state changes.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className={`glass-card-strong p-6 md:p-8 relative transition-all duration-500 border ${
          systemState === 'EMERGENCY' ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-red-950/5' :
          systemState === 'ALARM' ? 'border-orange-500/40 shadow-[0_0_50px_rgba(249,115,22,0.15)] bg-orange-950/5' :
          systemState === 'WARNING' ? 'border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.1)]' : 'border-white/10'
        }`}>

          {/* Sound & Status Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                systemState === 'EMERGENCY' ? 'bg-state-emergency animate-pulse-fast' :
                systemState === 'ALARM' ? 'bg-state-alarm animate-pulse' :
                systemState === 'WARNING' ? 'bg-state-warning animate-pulse' : 'bg-state-normal'
              }`} />
              <div>
                <span className="text-xs font-mono text-white/45">SIMULATION RUNNING</span>
                <h3 className="text-sm font-bold tracking-tight">Active State: <span className={
                  systemState === 'EMERGENCY' ? 'text-state-emergency' :
                  systemState === 'ALARM' ? 'text-state-alarm' :
                  systemState === 'WARNING' ? 'text-state-warning' : 'text-state-normal'
                }>{systemState}</span></h3>
              </div>
            </div>

            {/* Sound Toggle */}
            <button 
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
                isAudioMuted 
                  ? 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
              {isAudioMuted ? 'UNMUTE SIMULATOR BUZZER' : 'BUZZER SOUNDS ACTIVE'}
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* ── COLUMN 1: Sliders & Controls (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card p-5 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">Simulate Metrics</h4>

                {/* Drowsiness Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/45">Drowsiness Level</span>
                    <span className={`font-mono font-bold ${
                      drowsiness >= 80 ? 'text-state-alarm' : drowsiness >= 60 ? 'text-state-warning' : 'text-state-normal'
                    }`}>{drowsiness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={drowsiness}
                    onChange={(e) => {
                      setDrowsiness(Number(e.target.value))
                      // Scale speed down slightly as drowsiness increases
                      setSpeed(Math.max(15, Math.round(75 - Number(e.target.value) * 0.4)))
                    }}
                    disabled={systemState === 'EMERGENCY'}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-white/20 font-mono">
                    <span>NORMAL (30%)</span>
                    <span>WARN (60%)</span>
                    <span>ALARM (80%)</span>
                  </div>
                </div>

                {/* G-Force Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/45">G-Force Impact</span>
                    <span className={`font-mono font-bold ${gForce >= 3.0 ? 'text-state-emergency animate-pulse-fast' : 'text-white'}`}>{gForce.toFixed(2)} G</span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="5.0" 
                    step="0.05"
                    value={gForce}
                    onChange={(e) => setGForce(Number(e.target.value))}
                    disabled={systemState === 'EMERGENCY' && !sosSent}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/20 font-mono">
                    <span>NORMAL (1.0G)</span>
                    <span>POTENTIAL CRASH (3.0G+)</span>
                  </div>
                </div>

                {/* Speed indicator adjustment */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/45">Vehicle Speed</span>
                    <span className="font-mono text-white/80">{speed} km/h</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="140" 
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    disabled={systemState === 'EMERGENCY'}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/40"
                  />
                </div>
              </div>

              {/* Status summary box */}
              <div className="glass-card p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">ESP32 Hardware Logs</h4>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-[11px] text-white/50 space-y-1.5 h-36 overflow-y-auto">
                  <div>[esp32] boot successful...</div>
                  <div>[mpu6050] init: calibrated offset</div>
                  <div>[gps] lock: 6 satellites found</div>
                  <div>[gsm] check: status ok (SIM800L)</div>
                  {drowsiness >= 60 && <div className="text-yellow-400/80">[cv-warn] drowsiness alert triggered</div>}
                  {drowsiness >= 80 && <div className="text-orange-400">[mcu-alarm] buzzer pin 33 high active</div>}
                  {gForce >= 3.0 && <div className="text-red-400">[imu-emergency] g-force threshold exceeded! {gForce}G</div>}
                  {systemState === 'EMERGENCY' && <div className="text-red-500 animate-pulse">[mcu-sos] emergency countdown active: {sosCountdown}s</div>}
                  {sosSent && <div className="text-green-400">[gsm-sos] sms alert sent with coord 9.0301, 38.7613</div>}
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: Telemetry Metrics Display (4 Cols) ── */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {/* State Badge Container */}
              <div className="col-span-2 glass-card p-4 flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase">System State</div>
                <div className="flex items-center gap-3">
                  <span className={`state-badge text-xs px-4 py-1.5 ${
                    systemState === 'EMERGENCY' ? 'state-emergency glow-border' :
                    systemState === 'ALARM' ? 'state-alarm' :
                    systemState === 'WARNING' ? 'state-warning' : 'state-normal'
                  }`}>
                    {systemState}
                  </span>
                </div>
                <span className="text-[10px] text-white/20 font-mono">MCU Output Code: 0x0{
                  systemState === 'EMERGENCY' ? '4' : systemState === 'ALARM' ? '3' : systemState === 'WARNING' ? '2' : '1'
                }</span>
              </div>

              {/* Speed Metric */}
              <div className="glass-card p-4 h-28 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">Speed</span>
                  <Gauge className="w-3.5 h-3.5 text-white/25" />
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-white/80">{systemState === 'EMERGENCY' ? 0 : speed}</span>
                  <span className="text-[9px] text-white/30 ml-1">km/h</span>
                </div>
              </div>

              {/* G-Force Metric */}
              <div className="glass-card p-4 h-28 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">G-Force</span>
                  <Activity className="w-3.5 h-3.5 text-white/25" />
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-white/80">{gForce.toFixed(2)}</span>
                  <span className="text-[9px] text-white/30 ml-1">G</span>
                </div>
              </div>

              {/* Drowsiness Metric */}
              <div className="glass-card p-4 h-28 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">Drowsiness</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-white/25" />
                </div>
                <div>
                  <span className={`text-2xl font-bold font-mono ${
                    drowsiness >= 80 ? 'text-state-alarm animate-pulse' :
                    drowsiness >= 60 ? 'text-state-warning' : 'text-state-normal'
                  }`}>{drowsiness}</span>
                  <span className="text-[9px] text-white/30 ml-1">%</span>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="glass-card p-4 h-28 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">GPS Position</span>
                  <MapPin className="w-3.5 h-3.5 text-white/25" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-medium text-white/80 leading-tight">9.0301 N</div>
                  <div className="text-[11px] font-mono font-medium text-white/80 leading-tight">38.7613 E</div>
                </div>
              </div>
            </div>

            {/* ── COLUMN 3: Live Feeds & Logs (3 Cols) ── */}
            <div className="lg:col-span-3 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Live Log</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>

                <div className="space-y-3 h-52 overflow-y-auto pr-1">
                  {log.map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] alert-enter border-b border-white/[0.03] pb-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        alert.type === 'emergency' ? 'bg-state-emergency' :
                        alert.type === 'alarm' ? 'bg-state-alarm' :
                        alert.type === 'warning' ? 'bg-state-warning' : 'bg-state-normal'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 leading-normal break-words">{alert.msg}</p>
                        <span className="text-[9px] text-white/20 font-mono mt-0.5 block">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs text-white/30 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/30" />
              Simulating Addis Ababa Science &amp; Technology University Campus
            </span>
            <button onClick={onOpenDashboard} className="btn-primary flex items-center gap-2">
              <Play className="w-4 h-4" />
              Open Live Fleet Simulator
            </button>
          </div>

          {/* ── EMERGENCY MODAL OVERLAY ── */}
          {systemState === 'EMERGENCY' && (
            <div className="absolute inset-0 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30">
              
              {!sosSent ? (
                <div className="space-y-6 max-w-md">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto animate-pulse-fast">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-red-500 tracking-tight">CRASH TRIGGER DETECTED</h3>
                    <p className="text-xs text-white/50 mt-1 font-mono uppercase tracking-widest">IMPACT FORCE: {gForce.toFixed(2)} G</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="text-sm font-semibold">Initiating Emergency GSM Broadcast</div>
                    <div className="text-4xl font-black font-mono text-red-500 animate-pulse">{sosCountdown}s</div>
                    <p className="text-xs text-white/40 leading-relaxed">
                      GPS coordinates and hardware logs will be dispatched to predefined emergency lines automatically.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button 
                      onClick={cancelEmergency}
                      className="px-6 py-3.5 rounded-xl bg-white text-black font-bold text-sm transition-all duration-200 hover:bg-white/90 active:scale-95"
                    >
                      MUTE &amp; CANCEL FALSE ALARM
                    </button>
                    <span className="text-[10px] text-white/20 font-mono">
                      Cancel option terminates the GSM TX line within the 8-second window
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8 items-center max-w-3xl w-full">
                  {/* Left Column: Confirmation */}
                  <div className="text-left space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-white tracking-tight">Emergency Broadcast Sent</h3>
                      <p className="text-xs text-white/40 mt-1 font-mono">SIMULATED SMS TRANSMISSION COMPLETE</p>
                    </div>

                    <div className="space-y-3.5 text-xs text-white/50">
                      <p className="leading-relaxed">
                        The ESP32 microcontroller dispatched coordinates successfully over simulated AT command channels. 
                        A text payload containing mapping routing coordinates has been delivered to dispatch.
                      </p>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-green-400/80">
                        +CMGS: 42 · STATUS: SENT
                      </div>
                    </div>

                    <button 
                      onClick={cancelEmergency}
                      className="btn-secondary w-full py-3 hover:bg-white/10"
                    >
                      Reset Simulator
                    </button>
                  </div>

                  {/* Right Column: Phone mock image */}
                  <div className="relative flex justify-center">
                    <div className="relative w-72 h-[340px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img 
                        src="/emergency_sos_phone.png" 
                        alt="SOS message sent confirmation on smartphone"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}

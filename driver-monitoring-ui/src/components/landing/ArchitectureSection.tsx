import { useState } from 'react'
import { Camera, Monitor, Eye, Brain, Activity, Cpu, MapPin, Wifi, AlertTriangle, Gauge } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

const nodes = [
  { id: 'camera', label: 'Camera / Video Input', icon: Camera, color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10', desc: 'Webcam or video file input captured via OpenCV at configurable resolution (default 640x480).' },
  { id: 'preprocess', label: 'Frame Preprocessing', icon: Monitor, color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10', desc: 'Color space conversion (BGR→RGB) and frame resizing for MediaPipe processing.' },
  { id: 'mediapipe', label: 'MediaPipe Face Mesh', icon: Eye, color: 'text-violet-400', border: 'border-violet-400/30', bg: 'bg-violet-400/10', desc: '468 facial landmark detection providing precise face geometry for metric calculation.' },
  { id: 'metrics', label: 'EAR · MAR · PERCLOS\nBlink · Head Pose', icon: Activity, color: 'text-violet-400', border: 'border-violet-400/30', bg: 'bg-violet-400/10', desc: 'Eye Aspect Ratio, Mouth Aspect Ratio, PERCLOS rolling window, blink rate, and head pose estimation via solvePnP.' },
  { id: 'fatigue', label: 'Fatigue Score 0-100', icon: Brain, color: 'text-violet-400', border: 'border-violet-400/30', bg: 'bg-violet-400/10', desc: 'Weighted combination of all metrics producing a single fatigue score that drives the state machine.' },
  { id: 'esp32', label: 'ESP32 State Machine', icon: Cpu, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', desc: 'Microcontroller processes fatigue score + sensor data through NORMAL/WARNING/ALARM/EMERGENCY/MUTED states.' },
  { id: 'mpu6050', label: 'MPU6050 Crash Detection', icon: Gauge, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', desc: '3-axis accelerometer and gyroscope detects crash-like G-force and rotation events.' },
  { id: 'gps', label: 'GPS Location', icon: MapPin, color: 'text-state-normal', border: 'border-state-normal/30', bg: 'bg-state-normal/10', desc: 'NEO-6M GPS module provides live coordinates with fallback to preset demo location (AASTU campus).' },
  { id: 'gsm', label: 'GSM SOS Alert', icon: Wifi, color: 'text-state-emergency', border: 'border-state-emergency/30', bg: 'bg-state-emergency/10', desc: 'Simulated SMS alert with driver info, vehicle telemetry, and Google Maps link sent to emergency contact.' },
  { id: 'output', label: 'LCD · LEDs · Buzzer', icon: AlertTriangle, color: 'text-state-warning', border: 'border-state-warning/30', bg: 'bg-state-warning/10', desc: 'Local output devices: 16x2 LCD status display, tri-color LEDs (green/yellow/red), and buzzer for audio alerts.' },
]

const connections = [
  { from: 'camera', to: 'preprocess', color: 'from-cyan-400/40 to-cyan-400/10' },
  { from: 'preprocess', to: 'mediapipe', color: 'from-cyan-400/40 to-violet-400/10' },
  { from: 'mediapipe', to: 'metrics', color: 'from-violet-400/40 to-violet-400/10' },
  { from: 'metrics', to: 'fatigue', color: 'from-violet-400/40 to-violet-400/10' },
  { from: 'fatigue', to: 'esp32', color: 'from-violet-400/40 to-amber-400/10' },
  { from: 'mpu6050', to: 'esp32', color: 'from-amber-400/40 to-amber-400/10' },
  { from: 'esp32', to: 'gps', color: 'from-amber-400/40 to-state-normal/10' },
  { from: 'esp32', to: 'gsm', color: 'from-amber-400/40 to-state-emergency/10' },
  { from: 'esp32', to: 'output', color: 'from-amber-400/40 to-state-warning/10' },
]

export default function ArchitectureSection() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const activeNodeData = nodes.find(n => n.id === activeNode)

  return (
    <section id="architecture" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            System Design
          </div>
          <h2 className="section-title font-display mb-5">System Architecture</h2>
          <p className="section-subtitle">
            From camera input to emergency response — a complete data pipeline
          </p>
        </RevealSection>

        {/* Architecture Flow Diagram */}
        <div className="glass-card-strong p-6 md:p-10 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Top row - CV pipeline */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              {['camera', 'preprocess', 'mediapipe', 'metrics', 'fatigue'].map((id, i) => {
                const node = nodes.find(n => n.id === id)!
                return (
                  <div key={id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in">
                    <ArchNode node={node} active={activeNode === id} onClick={() => setActiveNode(activeNode === id ? null : id)} />
                  </div>
                )
              })}
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-violet-400/40 to-amber-400/40" />
                <div className="w-3 h-3 border-r-2 border-b-2 border-amber-400/40 rotate-45 -mt-2" />
              </div>
            </div>

            {/* Bottom row - Embedded pipeline */}
            <div className="grid grid-cols-5 gap-4">
              {['esp32', 'mpu6050', 'gps', 'gsm', 'output'].map((id, i) => {
                const node = nodes.find(n => n.id === id)!
                return (
                  <div key={id} style={{ animationDelay: `${(i + 5) * 100}ms` }} className="animate-fade-in">
                    <ArchNode node={node} active={activeNode === id} onClick={() => setActiveNode(activeNode === id ? null : id)} />
                  </div>
                )
              })}
            </div>

            {/* Data flow animation */}
            <div className="relative mt-10 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs text-white/30">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Computer Vision Pipeline</span>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse animate-delay-300" />
                <span>Embedded System Pipeline</span>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <div className="w-2 h-2 rounded-full bg-state-emergency animate-pulse animate-delay-700" />
                <span>Emergency Response</span>
              </div>
            </div>
          </div>

          {/* Active Node Info */}
          {activeNodeData && (
            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${activeNodeData.bg} ${activeNodeData.border} border flex items-center justify-center shrink-0`}>
                  <activeNodeData.icon className={`w-5 h-5 ${activeNodeData.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{activeNodeData.label.replace('\n', ' ')}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{activeNodeData.desc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400/30" />
            <span className="text-white/40">Video Capture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-violet-400/30" />
            <span className="text-white/40">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400/30" />
            <span className="text-white/40">Embedded Control</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-state-emergency/30" />
            <span className="text-white/40">Emergency</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArchNode({ node, active, onClick }: { node: typeof nodes[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer
        ${active ? `${node.bg} ${node.border} scale-105` : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}
        ${node.bg} ${node.border}`}
    >
      <node.icon className={`w-6 h-6 ${node.color} mx-auto mb-2`} />
      <span className={`text-xs font-medium whitespace-pre-line ${node.color}`}>
        {node.label}
      </span>
    </button>
  )
}

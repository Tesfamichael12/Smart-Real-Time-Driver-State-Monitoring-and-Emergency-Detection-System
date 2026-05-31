import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Wifi, AlertTriangle, Activity } from 'lucide-react'
import { cn } from '../../lib/utils'
import { VehicleData } from '../../types'

/* ─── Types ─────────────────────────────── */
interface FleetMapProps {
  vehicles: VehicleData[]
  onSelectVehicle: (id: string) => void
  selectedVehicleId?: string | null
}

/* ─── Road paths on the SVG viewBox 0 0 800 600 ─── */
const roads = {
  highways: [
    // Ring Road North (horizontal)
    'M 50,90 L 750,90',
    // Ring Road South (horizontal)
    'M 50,510 L 750,510',
    // Bole Road (vertical, main N-S artery)
    'M 400,30 L 400,570',
    // Haile Gebre Selassie (angled NW-SE)
    'M 50,200 L 400,90 L 750,200',
    // Mexico Square to Meskel Square
    'M 150,300 L 650,300',
    // Addis Ababa – Debre Zeit Road (diagonal SE)
    'M 400,300 L 750,570',
    // Airport Road (SW diagonal)
    'M 400,300 L 100,570',
  ],
  secondary: [
    // North connector grid
    'M 200,90 L 200,300',
    'M 300,90 L 300,300',
    'M 500,90 L 500,300',
    'M 600,90 L 600,300',
    // South connector grid
    'M 200,300 L 200,510',
    'M 300,300 L 300,510',
    'M 500,300 L 500,510',
    'M 600,300 L 600,510',
    // Horizontal secondary
    'M 50,200 L 750,200',
    'M 50,400 L 750,400',
  ],
  local: [
    // Dense city fabric
    'M 150,200 L 150,400',
    'M 650,200 L 650,400',
    'M 100,300 L 200,250',
    'M 600,250 L 700,300',
    'M 100,300 L 100,400',
    'M 700,300 L 700,400',
    'M 200,200 L 300,250 L 400,200',
    'M 400,200 L 500,250 L 600,200',
    'M 200,400 L 300,350 L 400,400',
    'M 400,400 L 500,350 L 600,400',
    'M 250,300 L 350,280 L 450,300 L 550,280 L 650,300',
    // Churchil Ave
    'M 400,90 L 400,300',
    'M 300,150 L 500,150',
    'M 300,450 L 500,450',
    'M 120,130 L 280,200',
    'M 520,200 L 680,130',
  ],
}

/* ─── Landmark labels ─── */
const landmarks = [
  { x: 398, y: 298, label: 'Meskel Sq.', dot: true },
  { x: 398, y: 98, label: 'Piassa', dot: true },
  { x: 398, y: 508, label: 'Bole Intl.', dot: true },
  { x: 148, y: 298, label: 'Mexico Sq.', dot: true },
  { x: 648, y: 298, label: 'Megenagna', dot: true },
  { x: 248, y: 88, label: 'Arat Kilo', dot: false },
  { x: 548, y: 88, label: 'Kazanchis', dot: false },
  { x: 200, y: 508, label: 'Akaki', dot: false },
  { x: 598, y: 508, label: 'CMC', dot: false },
]

/* ─── Vehicle route paths (waypoints in SVG coords) ─── */
const vehicleRoutes: Record<string, [number, number][]> = {
  'VEH-001': [[400,90],[400,150],[400,200],[400,250],[400,300],[400,350],[400,400],[400,450],[400,510]],
  'VEH-002': [[50,90],[150,90],[250,90],[350,90],[450,90],[550,90],[650,90],[750,90],[750,200]],
  'VEH-003': [[150,300],[250,300],[350,300],[450,300],[550,300],[650,300]],
  'VEH-004': [[400,300],[475,375],[550,450],[625,510],[700,570]],
  'VEH-005': [[400,300],[325,375],[250,450],[175,510],[100,570]],
}

interface Vehicle {
  id: string
  driver: string
  lat: number
  lng: number
  state: string
  speed: number
  fatigue: number
  pathIndex: number
  pathProgress: number
}

/* ─── Initial fleet ─── */
const initialVehicles: Vehicle[] = [
  { id: 'VEH-001', driver: 'Tesfa A.', lat: 9.0301, lng: 38.7613, state: 'NORMAL', speed: 45, fatigue: 18, pathIndex: 0, pathProgress: 0 },
  { id: 'VEH-002', driver: 'Hiwot B.', lat: 9.0412, lng: 38.7440, state: 'WARNING', speed: 62, fatigue: 76, pathIndex: 0, pathProgress: 0.3 },
  { id: 'VEH-003', driver: 'Dawit C.', lat: 9.0220, lng: 38.7520, state: 'NORMAL', speed: 38, fatigue: 32, pathIndex: 0, pathProgress: 0.5 },
  { id: 'VEH-004', driver: 'Sara D.',  lat: 8.9985, lng: 38.7780, state: 'ALARM', speed: 55, fatigue: 88, pathIndex: 0, pathProgress: 0.2 },
  { id: 'VEH-005', driver: 'Abel E.',  lat: 9.0055, lng: 38.7390, state: 'EMERGENCY', speed: 0, fatigue: 95, pathIndex: 0, pathProgress: 0.4 },
]

const stateColors: Record<string, string> = {
  NORMAL: '#22c55e',
  WARNING: '#eab308',
  ALARM: '#f97316',
  EMERGENCY: '#ef4444',
  MUTED: '#64748b',
}

const stateBgClass: Record<string, string> = {
  NORMAL: 'bg-state-normal/10 text-state-normal border-state-normal/25',
  WARNING: 'bg-state-warning/10 text-state-warning border-state-warning/25',
  ALARM: 'bg-state-alarm/10 text-state-alarm border-state-alarm/25',
  EMERGENCY: 'bg-state-emergency/10 text-state-emergency border-state-emergency/25',
  MUTED: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function vehiclePosition(route: [number, number][], progress: number): [number, number] {
  if (route.length < 2) return route[0] ?? [400, 300]
  const seg = progress * (route.length - 1)
  const i = Math.min(Math.floor(seg), route.length - 2)
  const t = seg - i
  return [lerp(route[i][0], route[i + 1][0], t), lerp(route[i][1], route[i + 1][1], t)]
}

export default function FleetMap({ vehicles, onSelectVehicle, selectedVehicleId }: FleetMapProps) {
  const [selected, setSelected] = useState<string | null>(selectedVehicleId || 'VEH-001')
  const [pathProgresses, setPathProgresses] = useState<Record<string, number>>({
    'VEH-001': 0,
    'VEH-002': 0.3,
    'VEH-003': 0.5,
    'VEH-004': 0.2,
    'VEH-005': 0.4,
  })
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Keep vehicles ref so animation is completely smooth and does not reset requestAnimationFrame
  const vehiclesRef = useRef(vehicles)
  useEffect(() => {
    vehiclesRef.current = vehicles
  }, [vehicles])

  // Sync selection from parent
  useEffect(() => {
    if (selectedVehicleId) {
      setSelected(selectedVehicleId)
    }
  }, [selectedVehicleId])

  // Animate vehicle movement
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animate = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      setPathProgresses(prev => {
        const next = { ...prev }
        vehiclesRef.current.forEach(v => {
          if (v.state === 'EMERGENCY') return
          const speed = prefersReducedMotion ? 0 : 0.012 + (v.speed / 1000)
          const currentProgress = prev[v.id] ?? 0
          const newProgress = currentProgress + speed * dt
          next[v.id] = newProgress >= 1 ? 0 : newProgress
        })
        return next
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const selectedVehicle = vehicles.find(v => v.id === selected)

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <span className="text-xs font-mono text-white/50 tracking-widest uppercase">Fleet Map · Addis Ababa</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-white/30">
            <Wifi className="w-3 h-3" /> Live
          </span>
          <span className="flex items-center gap-1.5 text-white/30">
            <Navigation className="w-3 h-3" /> 5 Vehicles
          </span>
        </div>
      </div>

      {/* Main Map SVG */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-[#070b0e]">
        {/* Scan-line overlay */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(6,182,212,0.012) 0px, rgba(6,182,212,0.012) 1px, transparent 1px, transparent 4px)',
          }}
        />

        <svg
          viewBox="0 0 800 600"
          className="w-full"
          style={{ maxHeight: '380px', display: 'block' }}
          aria-label="Fleet map showing vehicle positions in Addis Ababa"
        >
          {/* Map background */}
          <rect width="800" height="600" fill="#0a0e12" />

          {/* Grid */}
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`gx${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600"
              stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`gy${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50}
              stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          ))}

          {/* City blocks (subtle fill zones) */}
          {[
            { x: 210, y: 100, w: 80, h: 90 },
            { x: 310, y: 100, w: 80, h: 90 },
            { x: 510, y: 100, w: 80, h: 90 },
            { x: 610, y: 100, w: 80, h: 90 },
            { x: 60, y: 210, w: 80, h: 80 },
            { x: 210, y: 210, w: 80, h: 80 },
            { x: 310, y: 210, w: 80, h: 80 },
            { x: 510, y: 210, w: 80, h: 80 },
            { x: 610, y: 210, w: 80, h: 80 },
            { x: 660, y: 210, w: 80, h: 80 },
            { x: 210, y: 310, w: 80, h: 80 },
            { x: 310, y: 310, w: 80, h: 80 },
            { x: 510, y: 310, w: 80, h: 80 },
            { x: 610, y: 310, w: 80, h: 80 },
            { x: 210, y: 420, w: 80, h: 80 },
            { x: 310, y: 420, w: 80, h: 80 },
            { x: 510, y: 420, w: 80, h: 80 },
            { x: 610, y: 420, w: 80, h: 80 },
          ].map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2"
              fill="rgba(255,255,255,0.018)" />
          ))}

          {/* ── Local roads (thinnest) ── */}
          {roads.local.map((d, i) => (
            <path key={`l${i}`} d={d} fill="none"
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          ))}

          {/* ── Secondary roads ── */}
          {roads.secondary.map((d, i) => (
            <path key={`s${i}`} d={d} fill="none"
              stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          ))}

          {/* ── Highways (thickest + glow) ── */}
          {roads.highways.map((d, i) => (
            <g key={`h${i}`}>
              {/* Glow layer */}
              <path d={d} fill="none"
                stroke="rgba(6,182,212,0.08)" strokeWidth="8" />
              {/* Main road */}
              <path d={d} fill="none"
                stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
              {/* Center line */}
              <path d={d} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
                strokeDasharray="12,8" />
            </g>
          ))}

          {/* ── Landmark labels ── */}
          {landmarks.map((lm, i) => (
            <g key={i}>
              {lm.dot && (
                <>
                  <circle cx={lm.x} cy={lm.y} r="5" fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <circle cx={lm.x} cy={lm.y} r="2" fill="rgba(255,255,255,0.35)" />
                </>
              )}
              <text x={lm.x + (lm.dot ? 9 : 0)} y={lm.y + 4}
                fill="rgba(255,255,255,0.28)"
                fontSize="8.5"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="500"
              >
                {lm.label}
              </text>
            </g>
          ))}

          {/* Compass rose */}
          <g transform="translate(748, 48)">
            <circle r="18" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text y="-4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace" fontWeight="700">N</text>
            <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          </g>

          {/* Scale bar */}
          <g transform="translate(30, 576)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="60" y1="-4" x2="60" y2="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <text x="30" y="-8" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace">2 km</text>
          </g>

          {/* ── Vehicle markers ── */}
          {vehicles.map((v) => {
            const route = vehicleRoutes[v.id] ?? ([[400, 300]] as [number, number][])
            const progress = pathProgresses[v.id] ?? 0
            const [px, py] = vehiclePosition(route, progress)
            const color = stateColors[v.state]
            const isSelected = selected === v.id
            const isEmergency = v.state === 'EMERGENCY'

            return (
              <g
                key={v.id}
                transform={`translate(${px}, ${py})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const nextSelected = isSelected ? null : v.id
                  setSelected(nextSelected)
                  if (nextSelected) {
                    onSelectVehicle(nextSelected)
                  }
                }}
                role="button"
                aria-label={`Vehicle ${v.id}: ${v.driverName}, state ${v.state}`}
              >
                {/* Pulse ring */}
                <circle r={isEmergency ? '22' : isSelected ? '18' : '14'} fill="none"
                  stroke={color} strokeWidth={isEmergency ? '1.5' : '1'}
                  opacity={isEmergency ? '0.4' : '0.2'}
                >
                  {(isEmergency || isSelected) && (
                    <animate attributeName="r"
                      values={isEmergency ? "18;32;18" : "14;24;14"}
                      dur={isEmergency ? "0.8s" : "2s"}
                      repeatCount="indefinite" />
                  )}
                  {(isEmergency || isSelected) && (
                    <animate attributeName="opacity"
                      values="0.5;0;0.5"
                      dur={isEmergency ? "0.8s" : "2s"}
                      repeatCount="indefinite" />
                  )}
                </circle>

                {/* Vehicle body */}
                <circle r={isSelected ? '9' : '7'} fill={color} opacity="0.2" />
                <circle r={isSelected ? '7' : '5.5'}
                  fill={color}
                  stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />

                {/* Arrow direction indicator */}
                {route.length > 1 && (() => {
                  const seg = progress * (route.length - 1)
                  const i = Math.min(Math.floor(seg), route.length - 2)
                  const [ax, ay] = route[i]
                  const [bx, by] = route[i + 1]
                  const angle = Math.atan2(by - ay, bx - ax) * (180 / Math.PI)
                  return (
                    <g transform={`rotate(${angle})`}>
                      <polygon points="0,-2 5,0 0,2" fill="rgba(255,255,255,0.8)" opacity="0.6" />
                    </g>
                  )
                })()}

                {/* Selected label */}
                {isSelected && (
                  <g>
                    <rect x="-22" y="-26" width="44" height="14" rx="3"
                      fill="rgba(0,0,0,0.85)" stroke={color} strokeWidth="1" />
                    <text x="0" y="-16" textAnchor="middle"
                      fill="white" fontSize="7" fontFamily="monospace" fontWeight="600">
                      {v.id}
                    </text>
                  </g>
                )}

                {/* Emergency SOS indicator */}
                {isEmergency && (
                  <text x="0" y="21" textAnchor="middle"
                    fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="700">
                    SOS
                    <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Map corner info */}
        <div className="absolute top-3 left-3 text-[8px] font-mono text-white/20 leading-relaxed">
          <div>9.03°N 38.76°E</div>
          <div>Addis Ababa, ET</div>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="grid grid-cols-1 gap-2">
        {vehicles.map((v) => {
          const route = vehicleRoutes[v.id] ?? ([[400, 300]] as [number, number][])
          const progress = pathProgresses[v.id] ?? 0
          const [px, py] = vehiclePosition(route, progress)
          return (
            <button
              key={v.id}
              onClick={() => {
                const nextSelected = selected === v.id ? null : v.id
                setSelected(nextSelected)
                if (nextSelected) {
                  onSelectVehicle(nextSelected)
                }
              }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer w-full',
                selected === v.id
                  ? 'bg-white/[0.06] border-white/15'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
              )}
            >
              {/* State indicator */}
              <div className="relative shrink-0">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  v.state === 'EMERGENCY' ? 'animate-pulse-fast' : v.state === 'NORMAL' ? '' : 'animate-pulse'
                )} style={{ backgroundColor: stateColors[v.state] }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-white/70">{v.id}</span>
                  <span className="text-[10px] text-white/35 truncate">{v.driverName}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('state-badge !py-0 !px-1.5 !text-[8px]', stateBgClass[v.state])}>
                    {v.state}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">{v.speed} km/h</span>
                  <span className="text-[9px] font-mono text-white/30">Fat: {v.fatigueScore}%</span>
                </div>
              </div>

              {/* GPS coords */}
              <div className="flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-white/20" />
                <span className="text-[8px] font-mono text-white/20 hidden sm:block">
                  {(px / 800 * 0.15 + 38.7).toFixed(4)}
                </span>
              </div>

              {v.state === 'EMERGENCY' && (
                <AlertTriangle className="w-4 h-4 text-state-emergency animate-pulse-fast shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected vehicle detail panel */}
      {selectedVehicle && (
        <div className={cn(
          'p-4 rounded-xl border animate-slide-up',
          selectedVehicle.state === 'EMERGENCY'
            ? 'bg-state-emergency/5 border-state-emergency/20 emergency-pulse'
            : 'glass-card'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm font-display font-bold text-white/80">{selectedVehicle.id} — {selectedVehicle.driverName}</span>
            </div>
            <span className={cn('state-badge', stateBgClass[selectedVehicle.state])}>
              {selectedVehicle.state}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Speed', value: `${selectedVehicle.speed} km/h` },
              { label: 'Fatigue', value: `${selectedVehicle.fatigueScore}%` },
              { label: 'GPS', value: `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lng.toFixed(4)}` },
            ].map(m => (
              <div key={m.label} className="text-center">
                <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{m.label}</div>
                <div className="text-xs font-mono font-semibold text-white/70">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

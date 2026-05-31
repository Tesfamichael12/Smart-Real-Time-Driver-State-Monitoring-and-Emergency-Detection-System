import { VehicleData } from '../../types'
import { getStateColor } from '../../lib/utils'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface FleetMapProps {
  vehicles: VehicleData[]
  onSelectVehicle?: (vehicleId: string) => void
}

export default function FleetMap({ vehicles, onSelectVehicle }: FleetMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedVehicle = vehicles.find(v => v.id === selectedId)

  // Map bounds (Addis Ababa area)
  const minLat = 8.99, maxLat = 9.07
  const minLng = 38.71, maxLng = 38.82

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100
  const toY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * 100

  return (
    <div className="glass-card-strong p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/50" />
          <span className="text-sm font-semibold">Live Fleet Map</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30">Addis Ababa Region</span>
          <span className="text-[10px] text-white/20">AASTU Area</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative aspect-[16/9] rounded-xl bg-black/80 border border-white/10 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 map-grid" />

        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        </svg>

        {/* Vehicle markers */}
        {vehicles.map(v => {
          const x = toX(v.lng)
          const y = toY(v.lat)
          const color = getStateColor(v.state)
          const isSelected = selectedId === v.id

          return (
            <button
              key={v.id}
              onClick={() => {
                setSelectedId(isSelected ? null : v.id)
                onSelectVehicle?.(v.id)
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: isSelected ? 10 : 1 }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  isSelected ? 'scale-150' : 'hover:scale-125'
                }`}
                style={{
                  backgroundColor: `${color}30`,
                  borderColor: color,
                  boxShadow: isSelected ? `0 0 15px ${color}60` : undefined,
                }}
              >
                <div className="vehicle-marker w-full h-full rounded-full" style={{ backgroundColor: color }} />
              </div>
              {isSelected && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 rounded-xl p-3 w-48 text-xs animate-fade-in z-20">
                  <div className="font-semibold mb-2">{v.driverName}</div>
                  <div className="space-y-1 text-white/50">
                    <div className="flex justify-between"><span>Vehicle</span><span className="font-mono text-white/70">{v.id}</span></div>
                    <div className="flex justify-between"><span>Speed</span><span className="font-mono text-white/70">{v.speed.toFixed(0)} km/h</span></div>
                    <div className="flex justify-between"><span>Fatigue</span><span className="font-mono text-white/70">{v.fatigueScore}%</span></div>
                    <div className="flex justify-between"><span>State</span><span className="font-mono" style={{ color }}>{v.state}</span></div>
                    <div className="flex justify-between"><span>GPS</span><span className="font-mono text-white/50">{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span></div>
                  </div>
                </div>
              )}
            </button>
          )
        })}

        {/* Map Label */}
        <div className="absolute bottom-2 left-2 text-[10px] text-white/15 font-mono">
          {vehicles.length} vehicles tracked
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs">
        {[['NORMAL', '#22c55e'], ['WARNING', '#eab308'], ['ALARM', '#f97316'], ['EMERGENCY', '#ef4444']].map(([state, color]) => (
          <div key={state} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/40">{state}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { VehicleData } from '../../types'
import StatusBadge from '../shared/StatusBadge'
import { cn } from '../../lib/utils'
import { Eye, ChevronDown } from 'lucide-react'

interface VehicleTableProps {
  vehicles: VehicleData[]
  onSelectVehicle: (vehicleId: string) => void
}

export default function VehicleTable({ vehicles, onSelectVehicle }: VehicleTableProps) {
  const [filter, setFilter] = useState<string>('ALL')

  const filtered = filter === 'ALL' ? vehicles : vehicles.filter(v => v.state === filter)
  const states = ['ALL', 'NORMAL', 'WARNING', 'ALARM', 'EMERGENCY']

  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Vehicle Fleet</h3>
        <div className="flex items-center gap-1">
          {states.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all',
                filter === s ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 px-2 text-white/30 font-medium uppercase tracking-wider">Vehicle</th>
              <th className="text-left py-2 px-2 text-white/30 font-medium uppercase tracking-wider">Driver</th>
              <th className="text-left py-2 px-2 text-white/30 font-medium uppercase tracking-wider">State</th>
              <th className="text-right py-2 px-2 text-white/30 font-medium uppercase tracking-wider">Speed</th>
              <th className="text-right py-2 px-2 text-white/30 font-medium uppercase tracking-wider">Fatigue</th>
              <th className="text-right py-2 px-2 text-white/30 font-medium uppercase tracking-wider">G-Force</th>
              <th className="text-right py-2 px-2 text-white/30 font-medium uppercase tracking-wider">GPS</th>
              <th className="text-right py-2 px-2 text-white/30 font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-2">
                  <span className="font-mono font-medium">{v.id}</span>
                </td>
                <td className="py-3 px-2 text-white/70">{v.driverName}</td>
                <td className="py-3 px-2">
                  <StatusBadge state={v.state} className="text-[9px]" pulsing={false} />
                </td>
                <td className="py-3 px-2 text-right font-mono text-white/60">{v.speed.toFixed(0)}</td>
                <td className="py-3 px-2 text-right font-mono" style={{ color: v.fatigueScore >= 85 ? '#ef4444' : v.fatigueScore >= 75 ? '#eab308' : '#22c55e' }}>
                  {v.fatigueScore}%
                </td>
                <td className="py-3 px-2 text-right font-mono" style={{ color: v.gForce >= 3.0 ? '#ef4444' : v.gForce >= 2.2 ? '#f97316' : 'inherit' }}>
                  {v.gForce.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-white/30 text-[10px]">
                  {v.lat.toFixed(2)}, {v.lng.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => onSelectVehicle(v.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="View driver details"
                  >
                    <Eye className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">No vehicles match this filter</div>
        )}
      </div>

      <div className="mt-3 text-[10px] text-white/20">{filtered.length} vehicle(s) shown</div>
    </div>
  )
}

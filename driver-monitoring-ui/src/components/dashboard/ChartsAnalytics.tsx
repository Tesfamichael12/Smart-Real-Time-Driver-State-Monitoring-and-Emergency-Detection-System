import { useState, useEffect } from 'react'
import { VehicleData } from '../../types'
import { BarChart3, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts'

interface ChartsAnalyticsProps {
  vehicles: VehicleData[]
  historyData: { time: string; fatigue: number; gForce: number; speed: number }[]
}

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444']

export default function ChartsAnalytics({ vehicles, historyData }: ChartsAnalyticsProps) {
  const alertDist = [
    { name: 'Normal', value: vehicles.filter(v => v.state === 'NORMAL').length },
    { name: 'Warning', value: vehicles.filter(v => v.state === 'WARNING').length },
    { name: 'Alarm', value: vehicles.filter(v => v.state === 'ALARM').length },
    { name: 'Emergency', value: vehicles.filter(v => v.state === 'EMERGENCY').length },
  ]

  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-white/50" />
        <span className="text-sm font-semibold">Charts & Analytics</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Fatigue Trend */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/30 uppercase tracking-wider">Fatigue Score Trend</span>
            <TrendingUp className="w-3.5 h-3.5 text-white/20" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
              <Area type="monotone" dataKey="fatigue" stroke="#ef4444" fill="url(#fatigueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* G-Force Trend */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/30 uppercase tracking-wider">G-Force Trend</span>
            <TrendingUp className="w-3.5 h-3.5 text-white/20" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="gForceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
              <Area type="monotone" dataKey="gForce" stroke="#f97316" fill="url(#gForceGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Distribution */}
        <div className="glass-card p-4">
          <span className="text-xs text-white/30 uppercase tracking-wider block mb-3">Alert Distribution</span>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={alertDist.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {alertDist.filter(d => d.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Speed Trend */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/30 uppercase tracking-wider">Speed Trend</span>
            <TrendingUp className="w-3.5 h-3.5 text-white/20" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
              <Line type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

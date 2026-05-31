import { useState } from 'react'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard, Users, Truck, Bell, ShieldAlert, Map, Eye, Cpu,
  BarChart3, Settings, ChevronLeft, ChevronRight, Gauge
} from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'drivers', label: 'Live Drivers', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'emergency', label: 'Emergency Centre', icon: ShieldAlert },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'cv', label: 'Computer Vision', icon: Eye },
  { id: 'telemetry', label: 'Embedded Telemetry', icon: Cpu },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 bg-black border-r border-white/10 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Gauge className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-sm font-bold whitespace-nowrap">SafeDrive</span>}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              activeSection === item.id
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}

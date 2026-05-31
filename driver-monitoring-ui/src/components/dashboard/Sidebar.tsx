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
        'fixed left-0 top-0 h-full z-40 bg-black/60 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          {!collapsed && (
            <span className="text-sm font-black font-display tracking-tight text-white/90 bg-clip-text">
              SafeDrive<span className="text-cyan-400">.</span>
            </span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide uppercase transition-all duration-300 relative group',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 text-white border-l-2 border-cyan-500 shadow-[inset_1px_0_10px_rgba(6,182,212,0.05)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-105',
                isActive ? 'text-cyan-400' : 'text-white/40 group-hover:text-white/70'
              )} />
              {!collapsed && <span className="truncate font-mono">{item.label}</span>}
              
              {/* Active right glow indicator */}
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2.5 border-t border-white/5 bg-white/[0.01]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <ChevronLeft className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </aside>
  )
}

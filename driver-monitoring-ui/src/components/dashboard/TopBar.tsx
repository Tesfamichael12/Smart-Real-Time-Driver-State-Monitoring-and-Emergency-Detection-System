import { useState, useEffect } from 'react'
import { Search, Bell, User, Radio } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TopBarProps {
  alertCount: number
  onSearch?: (query: string) => void
}

export default function TopBar({ alertCount, onSearch }: TopBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-black/50 backdrop-blur-xl">
      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 w-80">
        <Search className="w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search drivers or vehicles..."
          className="bg-transparent border-none outline-none text-sm text-white/70 placeholder-white/30 w-full"
          onChange={e => onSearch?.(e.target.value)}
        />
        <span className="text-[10px] text-white/20 font-mono">⌘K</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Live Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-state-normal/5 border border-state-normal/20">
          <Radio className="w-3.5 h-3.5 text-state-normal animate-pulse" />
          <span className="text-xs font-medium text-state-normal">LIVE</span>
        </div>

        {/* Time */}
        <span className="text-sm text-white/50 font-mono hidden md:block">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4 text-white/50" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-state-emergency text-[9px] font-bold flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Admin */}
        <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white/60" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium">Admin</div>
            <div className="text-[10px] text-white/30">Fleet Manager</div>
          </div>
        </button>
      </div>
    </header>
  )
}

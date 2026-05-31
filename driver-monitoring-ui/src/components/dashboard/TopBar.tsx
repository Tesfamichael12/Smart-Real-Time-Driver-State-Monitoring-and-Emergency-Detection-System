import { useState, useEffect } from 'react'
import { Search, Bell, User, Radio } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TopBarProps {
  alertCount: number
  onSearch?: (query: string) => void
}

export default function TopBar({ alertCount, onSearch }: TopBarProps) {
  const [time, setTime] = useState(new Date())
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-black/40 backdrop-blur-xl relative z-30">
      {/* Search */}
      <div className={cn(
        "hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border transition-all duration-300 w-80",
        isFocused ? "border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)] bg-black" : "border-white/10"
      )}>
        <Search className={cn("w-4 h-4 transition-colors", isFocused ? "text-cyan-400" : "text-white/30")} />
        <input
          type="text"
          placeholder="Search drivers or vehicles..."
          className="bg-transparent border-none outline-none text-xs text-white/70 placeholder-white/30 w-full font-sans"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={e => onSearch?.(e.target.value)}
        />
        <span className="text-[9px] text-white/20 font-mono tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">⌘K</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Live Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-400">TELEMETRY ON</span>
        </div>

        {/* Time */}
        <span className="text-xs text-white/40 font-mono hidden md:block bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-300">
          <Bell className="w-4 h-4 text-white/50" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center border border-black shadow-[0_0_8px_rgba(244,63,94,0.4)] text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Admin */}
        <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center shadow-inner">
            <User className="w-4 h-4 text-white/60" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white/80 font-display">Admin</div>
            <div className="text-[9px] text-white/30 font-mono tracking-wider">FLEET OPERATOR</div>
          </div>
        </button>
      </div>
    </header>
  )
}

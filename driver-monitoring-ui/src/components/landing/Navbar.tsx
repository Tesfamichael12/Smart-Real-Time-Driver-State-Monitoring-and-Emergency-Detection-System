import { useState, useEffect } from 'react'
import { Shield, Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Computer Vision', href: '#cv-module' },
  { label: 'Embedded System', href: '#embedded' },
  { label: 'Dashboard', href: '#demo' },
  { label: 'Testing', href: '#testing' },
  { label: 'Team', href: '#team' },
]

export default function Navbar({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight">SafeDrive</span>
              <span className="text-base font-bold text-white/50 ml-1">Guardian</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link px-3 py-2 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onOpenDashboard} className="btn-secondary text-xs px-4 py-2.5">
              Live Dashboard
            </button>
            <a href="#demo" className="btn-primary text-xs px-4 py-2.5">
              Launch Demo
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block nav-link px-4 py-3 rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 space-y-2">
              <button onClick={() => { onOpenDashboard(); setMobileOpen(false) }} className="w-full btn-secondary text-center">
                Live Dashboard
              </button>
              <a href="#demo" className="block btn-primary text-center" onClick={() => setMobileOpen(false)}>
                Launch Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

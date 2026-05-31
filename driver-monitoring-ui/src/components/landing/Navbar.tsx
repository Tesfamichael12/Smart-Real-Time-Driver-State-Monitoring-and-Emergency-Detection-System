import { useState, useEffect } from 'react'
import { Shield, Menu, X, Play } from 'lucide-react'
import { cn } from '../../lib/utils'
import { scrollToSection } from '../../hooks/useLenis'

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Computer Vision', href: '#cv-module' },
  { label: 'Embedded', href: '#embedded' },
  { label: 'Dashboard', href: '#demo' },
  { label: 'Testing', href: '#testing' },
  { label: 'Team', href: '#team' },
]

export default function Navbar({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_LINKS.map(l => document.querySelector(l.href)).filter(Boolean) as Element[]
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveHref(`#${e.target.id}`)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const handleLink = (href: string) => {
    scrollToSection(href)
    setActiveHref(href)
    setMobileOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      {/* Floating pill */}
      <div
        className={cn(
          'pointer-events-auto w-full max-w-7xl rounded-2xl transition-all duration-500',
          scrolled
            ? 'bg-black/75 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
            : 'bg-transparent border border-transparent'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 md:px-6">

          {/* Logo */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); scrollToSection('#overview') }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300',
              scrolled ? 'bg-white/10 border border-white/15' : 'bg-white/8 border border-white/10',
              'group-hover:bg-accent-cyan/20 group-hover:border-accent-cyan/30'
            )}>
              <Shield className="w-4 h-4 text-white/80 group-hover:text-accent-cyan transition-colors" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-sm tracking-tight text-white">SafeDrive</span>
              <span className="font-display font-bold text-sm text-white/35 ml-1">Guardian</span>
            </div>
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  activeHref === link.href
                    ? 'text-white bg-white/8'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                )}
              >
                {link.label}
                {activeHref === link.href && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-cyan" />
                )}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/70 border border-white/12 hover:bg-white/6 hover:border-white/20 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-state-normal animate-pulse" />
              Live Dashboard
            </button>
            <button
              onClick={() => handleLink('#demo')}
              className="btn-primary-cyan flex items-center gap-1.5 !px-4 !py-2 text-xs"
            >
              <Play className="w-3 h-3" />
              Demo
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-white/70" /> : <Menu className="w-5 h-5 text-white/70" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/8 animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                    activeHref === link.href
                      ? 'text-white bg-white/8'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 space-y-2">
                <button
                  onClick={() => { onOpenDashboard(); setMobileOpen(false) }}
                  className="w-full btn-secondary text-center text-sm"
                >
                  Live Dashboard
                </button>
                <button
                  onClick={() => handleLink('#demo')}
                  className="w-full btn-primary-cyan text-center text-sm"
                >
                  Launch Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

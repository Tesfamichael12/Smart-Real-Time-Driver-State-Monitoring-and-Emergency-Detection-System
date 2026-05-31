import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function useLenis() {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Create Lenis instance
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    })

    // RAF loop
    function raf(time: number) {
      lenisInstance?.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafRef.current)
      lenisInstance?.destroy()
      lenisInstance = null
    }
  }, [])

  return lenisInstance
}

export function scrollToSection(href: string) {
  const target = document.querySelector(href)
  if (!target) return
  if (lenisInstance) {
    lenisInstance.scrollTo(target as HTMLElement, { offset: -80, duration: 1.4 })
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

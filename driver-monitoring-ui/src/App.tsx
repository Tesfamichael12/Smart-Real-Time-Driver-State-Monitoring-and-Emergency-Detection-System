import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import { useLenis } from './hooks/useLenis'

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing')

  // Initialize Lenis only on landing page (dashboard has fixed layout, no page scroll)
  useLenis()

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onOpenDashboard={() => setView('dashboard')} />
      ) : (
        <DashboardPage onBackToLanding={() => setView('landing')} />
      )}
    </>
  )
}

import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing')

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

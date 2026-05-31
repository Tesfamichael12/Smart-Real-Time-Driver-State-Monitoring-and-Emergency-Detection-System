import { useState, useCallback, useRef, useEffect } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { ScenarioType } from '../data/simulation'
import { cn } from '../lib/utils'

import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import KPIHeroRow from '../components/dashboard/KPIHeroRow'
import FleetMap from '../components/dashboard/FleetMap'
import LiveDriverPanel from '../components/dashboard/LiveDriverPanel'
import EmbeddedTelemetryPanel from '../components/dashboard/EmbeddedTelemetryPanel'
import AlertFeed from '../components/dashboard/AlertFeed'
import EmergencyCenter from '../components/dashboard/EmergencyCenter'
import VehicleTable from '../components/dashboard/VehicleTable'
import DriverDetailDrawer from '../components/dashboard/DriverDetailDrawer'
import ChartsAnalytics from '../components/dashboard/ChartsAnalytics'
import EventTimeline from '../components/dashboard/EventTimeline'
import SimulationControls from '../components/dashboard/SimulationControls'
import DataProtocolPreview from '../components/dashboard/DataProtocolPreview'

interface ChartData {
  time: string
  fatigue: number
  gForce: number
  speed: number
}

export default function DashboardPage({ onBackToLanding }: { onBackToLanding: () => void }) {
  const { simState, triggerScenario, selectDriver, acknowledgeAlert } = useSimulation()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [historyData, setHistoryData] = useState<ChartData[]>([])

  const selectedVehicle = simState.vehicles.find(v => v.id === selectedVehicleId) || simState.vehicles[0]

  // Track chart history
  useEffect(() => {
    const newPoint: ChartData = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      fatigue: selectedVehicle.fatigueScore,
      gForce: selectedVehicle.gForce,
      speed: selectedVehicle.speed,
    }
    setHistoryData(prev => {
      const next = [...prev, newPoint]
      if (next.length > 30) return next.slice(-30)
      return next
    })
  }, [simState.vehicles]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScenario = useCallback((scenario: ScenarioType) => {
    triggerScenario(scenario, selectedVehicleId || undefined)
  }, [triggerScenario, selectedVehicleId])

  const unreadAlerts = simState.alerts.filter(a => !a.acknowledged).length

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <KPIHeroRow vehicles={simState.vehicles} />
            <div className="grid lg:grid-cols-2 gap-6">
              <FleetMap vehicles={simState.vehicles} onSelectVehicle={id => { setSelectedVehicleId(id); setShowDrawer(true) }} />
              <AlertFeed alerts={simState.alerts} onAcknowledge={acknowledgeAlert} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <LiveDriverPanel vehicle={selectedVehicle} />
              <EmbeddedTelemetryPanel vehicle={selectedVehicle} />
            </div>
            <ChartsAnalytics vehicles={simState.vehicles} historyData={historyData} />
            <div className="grid lg:grid-cols-2 gap-6">
              <EventTimeline events={simState.events} />
              <SimulationControls
                vehicleId={selectedVehicleId || selectedVehicle.id}
                onTrigger={handleScenario}
              />
            </div>
            <DataProtocolPreview vehicle={selectedVehicle} />
          </div>
        )

      case 'map':
        return (
          <div className="space-y-6">
            <FleetMap vehicles={simState.vehicles} onSelectVehicle={id => { setSelectedVehicleId(id); setShowDrawer(true) }} />
            <div className="grid lg:grid-cols-2 gap-6">
              <EventTimeline events={simState.events} />
              <SimulationControls vehicleId={selectedVehicle.id} onTrigger={handleScenario} />
            </div>
          </div>
        )

      case 'drivers':
      case 'cv':
        return (
          <div className="space-y-6">
            <LiveDriverPanel vehicle={selectedVehicle} />
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartsAnalytics vehicles={simState.vehicles} historyData={historyData} />
              <DataProtocolPreview vehicle={selectedVehicle} />
            </div>
          </div>
        )

      case 'telemetry':
        return (
          <div className="space-y-6">
            <EmbeddedTelemetryPanel vehicle={selectedVehicle} />
            <DataProtocolPreview vehicle={selectedVehicle} />
          </div>
        )

      case 'alerts':
        return (
          <div className="space-y-6">
            <AlertFeed alerts={simState.alerts} onAcknowledge={acknowledgeAlert} />
            <EventTimeline events={simState.events} />
          </div>
        )

      case 'emergency':
        return (
          <div className="space-y-6">
            <EmergencyCenter
              vehicle={simState.emergencyActive ? (simState.vehicles.find(v => v.id === simState.emergencyVehicleId) || null) : null}
              sosCountdown={simState.sosCountdown}
              gsmLog={simState.gsmLog}
              onAcknowledge={() => {}}
              onCancel={() => triggerScenario('mute', simState.emergencyVehicleId || undefined)}
              onResolve={() => triggerScenario('reset', simState.emergencyVehicleId || undefined)}
            />
            <SimulationControls vehicleId={selectedVehicle.id} onTrigger={handleScenario} />
          </div>
        )

      case 'vehicles':
        return (
          <div className="space-y-6">
            <VehicleTable vehicles={simState.vehicles} onSelectVehicle={id => { setSelectedVehicleId(id); setShowDrawer(true) }} />
            <FleetMap vehicles={simState.vehicles} onSelectVehicle={id => { setSelectedVehicleId(id); setShowDrawer(true) }} />
          </div>
        )

      case 'reports':
        return (
          <div className="space-y-6">
            <ChartsAnalytics vehicles={simState.vehicles} historyData={historyData} />
            <DataProtocolPreview vehicle={selectedVehicle} />
            <EventTimeline events={simState.events} />
          </div>
        )

      default:
        return <div className="text-white/40 text-center py-20">Section coming soon</div>
    }
  }

  // Emergency banner that shows at the top during emergencies
  const isEmergency = simState.emergencyActive

  return (
    <div className="min-h-screen bg-black">
      {isEmergency && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-state-emergency/20 border-b border-state-emergency/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-state-emergency animate-pulse-fast" />
              <span className="text-sm font-bold text-state-emergency">EMERGENCY ACTIVE</span>
              <span className="text-xs text-state-emergency/70">
                {simState.vehicles.find(v => v.id === simState.emergencyVehicleId)?.driverName} · {simState.emergencyVehicleId}
              </span>
            </div>
            <button
              onClick={() => setActiveSection('emergency')}
              className="text-xs px-3 py-1 rounded-lg bg-state-emergency/20 text-state-emergency hover:bg-state-emergency/30 transition-colors"
            >
              View Emergency Centre
            </button>
          </div>
        </div>
      )}

      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-56'
      )}>
        <TopBar alertCount={unreadAlerts} />

        <main className={cn('p-4 md:p-6 space-y-6', isEmergency ? 'pt-14' : '')}>
          {/* Back to landing */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold capitalize">{activeSection} Dashboard</h1>
            <button
              onClick={onBackToLanding}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              ← Back to Website
            </button>
          </div>

          {renderSection()}
        </main>
      </div>

      {/* Driver Detail Drawer */}
      {showDrawer && selectedVehicle && (
        <DriverDetailDrawer
          vehicle={selectedVehicle}
          alerts={simState.alerts}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  )
}

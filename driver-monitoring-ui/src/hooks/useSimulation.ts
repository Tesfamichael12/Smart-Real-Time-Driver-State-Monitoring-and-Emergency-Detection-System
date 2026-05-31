import { useState, useEffect, useCallback, useRef } from 'react'
import { SimulationState, createInitialSimulation, tickSimulation, applyScenario, ScenarioType } from '../data/simulation'

export function useSimulation() {
  const [simState, setSimState] = useState<SimulationState>(createInitialSimulation)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick simulation every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSimState(prev => {
        const updated = tickSimulation(prev)

        // Handle SOS countdown
        if (updated.sosCountdown > 0) {
          updated.sosCountdown -= 1
          updated.vehicles = updated.vehicles.map(v => {
            if (v.id === updated.emergencyVehicleId) {
              const vv = { ...v }
              vv.sosCountdown = updated.sosCountdown
              if (updated.sosCountdown <= 0 && !vv.sosSent && vv.state === 'EMERGENCY') {
                vv.sosSent = true
                updated.gsmLog = [
                  'AT',
                  'OK',
                  'AT+CMGF=1',
                  'OK',
                  `AT+CMGS="+2519XXXXXXXX"`,
                  '> EMERGENCY ALERT! Possible crash or critical driver state detected.',
                  `> Vehicle: ${vv.id}`,
                  `> Driver: ${vv.driverName}`,
                  `> G-Force: ${vv.gForce.toFixed(2)} G`,
                  `> Location: ${vv.lat.toFixed(6)}, ${vv.lng.toFixed(6)}`,
                  `> https://maps.google.com/?q=${vv.lat.toFixed(6)},${vv.lng.toFixed(6)}`,
                  '> Ctrl+Z',
                  'SOS MESSAGE SENT SUCCESSFULLY.',
                ]
                updated.events.push({
                  id: Math.random().toString(36).substring(2, 10),
                  timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                  message: `SOS sent for ${vv.driverName} (${vv.id})`,
                  type: 'emergency',
                })
              }
              return vv
            }
            return v
          })
        }

        return { ...updated }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const triggerScenario = useCallback((scenario: ScenarioType, vehicleId?: string) => {
    setSimState(prev => applyScenario(prev, scenario, vehicleId || prev.vehicles[0]?.id || 'VEH-001'))
  }, [])

  const selectDriver = useCallback((driverId: string | null) => {
    setSimState(prev => ({ ...prev, selectedDriverId: driverId }))
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setSimState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a),
    }))
  }, [])

  return {
    simState,
    triggerScenario,
    selectDriver,
    acknowledgeAlert,
  }
}

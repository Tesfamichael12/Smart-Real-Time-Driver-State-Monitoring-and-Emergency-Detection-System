import { VehicleData, Alert, EventLog, DriverState, SimulationState } from '../types'
import { generateId, formatTimestamp, randomBetween, randomInt, clamp } from '../lib/utils'

const DRIVERS = [
  { id: 'DRV-001', name: 'Tesfa A.', vehicleId: 'VEH-001', route: 'Bole - Merkato' },
  { id: 'DRV-002', name: 'Tewodros G.', vehicleId: 'VEH-002', route: 'Piassa - Megenagna' },
  { id: 'DRV-003', name: 'Thressa M.', vehicleId: 'VEH-003', route: 'CMC - Mexico' },
  { id: 'DRV-004', name: 'Tigist K.', vehicleId: 'VEH-004', route: 'Ayat - Kazanchis' },
  { id: 'DRV-005', name: 'Tsegaye B.', vehicleId: 'VEH-005', route: 'Summit - Lebu' },
]

// Base positions around Addis Ababa
const BASE_POSITIONS = [
  { lat: 9.0301, lng: 38.7613 },
  { lat: 9.0450, lng: 38.7750 },
  { lat: 9.0200, lng: 38.7450 },
  { lat: 9.0350, lng: 38.7800 },
  { lat: 9.0500, lng: 38.7500 },
]

function getStateFromFatigue(fatigue: number, crashDetected: boolean, sosSent: boolean, systemMuted: boolean): DriverState {
  if (systemMuted) return 'MUTED'
  if (crashDetected || fatigue >= 90) return 'EMERGENCY'
  if (fatigue >= 85) return 'ALARM'
  if (fatigue >= 75) return 'WARNING'
  return 'NORMAL'
}

function createInitialVehicle(index: number): VehicleData {
  const driver = DRIVERS[index]
  const pos = BASE_POSITIONS[index]
  const baseFatigue = randomInt(20, 45)

  return {
    id: driver.vehicleId,
    driverId: driver.id,
    driverName: driver.name,
    speed: randomBetween(30, 80),
    fatigueScore: baseFatigue,
    gForce: randomBetween(0.8, 1.2),
    gyroDps: randomBetween(5, 30),
    temperature: randomBetween(34, 40),
    lat: pos.lat + randomBetween(-0.005, 0.005),
    lng: pos.lng + randomBetween(-0.005, 0.005),
    state: getStateFromFatigue(baseFatigue, false, false, false),
    ear: randomBetween(0.28, 0.35),
    mar: randomBetween(0.1, 0.3),
    perclos: randomBetween(2, 15),
    blinkRate: randomInt(10, 20),
    headPose: {
      pitch: randomBetween(-10, 10),
      yaw: randomBetween(-8, 8),
      roll: randomBetween(-5, 5),
    },
    faceDetected: true,
    sosSent: false,
    crashDetected: false,
    sosCountdown: 0,
    lastUpdate: new Date().toISOString(),
  }
}

export type { SimulationState }


export type ScenarioType = 'normal' | 'warning' | 'alarm' | 'critical' | 'crash' | 'face_lost' | 'gps_fallback' | 'sos_sent' | 'mute' | 'reset'

export function createInitialSimulation(): SimulationState {
  const state: SimulationState = {
    vehicles: DRIVERS.map((_, i) => createInitialVehicle(i)),
    alerts: [],
    events: [],
    emergencyActive: false,
    emergencyVehicleId: null,
    selectedDriverId: null,
    scenario: 'normal',
    sosCountdown: 0,
    gsmLog: [],
  }

  state.events.push({
    id: generateId(),
    timestamp: formatTimestamp(new Date()),
    message: 'System boot complete. All modules initialized.',
    type: 'system',
  })

  state.events.push({
    id: generateId(),
    timestamp: formatTimestamp(new Date()),
    message: 'Computer vision module online. 5 drivers monitored.',
    type: 'info',
  })

  state.events.push({
    id: generateId(),
    timestamp: formatTimestamp(new Date()),
    message: 'ESP32 embedded telemetry active. All sensors reporting.',
    type: 'info',
  })

  return state
}

function addAlert(state: SimulationState, severity: Alert['severity'], driverName: string, vehicleId: string, message: string, source: Alert['source']) {
  const alert: Alert = {
    id: generateId(),
    severity,
    timestamp: formatTimestamp(new Date()),
    driverName,
    vehicleId,
    message,
    source,
    acknowledged: false,
  }
  state.alerts.unshift(alert)
  if (state.alerts.length > 50) state.alerts.pop()

  state.events.push({
    id: generateId(),
    timestamp: formatTimestamp(new Date()),
    message: `[${source}] ${driverName} - ${message}`,
    type: severity === 'emergency' ? 'emergency' : severity === 'alarm' ? 'alert' : 'info',
  })
}

export function applyScenario(state: SimulationState, scenario: ScenarioType, vehicleId: string): SimulationState {
  const sourceVehicle = state.vehicles.find(v => v.id === vehicleId) || state.vehicles[0]
  if (!sourceVehicle) return state

  // Immutable update: clone everything to avoid mutating React state
  const now = new Date()
  const vehicle = { ...sourceVehicle }
  const newAlerts = [...state.alerts]
  const newEvents = [...state.events]
  let newGsmLog = [...state.gsmLog]
  let emergencyActive = state.emergencyActive
  let emergencyVehicleId = state.emergencyVehicleId
  let sosCountdown = state.sosCountdown

  const addAlertLocal = (severity: Alert['severity'], driverName: string, vehId: string, message: string, source: Alert['source']) => {
    newAlerts.unshift({
      id: generateId(),
      severity,
      timestamp: formatTimestamp(now),
      driverName,
      vehicleId: vehId,
      message,
      source,
      acknowledged: false,
    })
    if (newAlerts.length > 50) newAlerts.pop()

    newEvents.push({
      id: generateId(),
      timestamp: formatTimestamp(now),
      message: `[${source}] ${driverName} - ${message}`,
      type: severity === 'emergency' ? 'emergency' : severity === 'alarm' ? 'alert' : 'info',
    })
  }

  let forceMuted = false
  const prevState = vehicle.state

  switch (scenario) {
    case 'normal':
      vehicle.fatigueScore = randomBetween(15, 35)
      vehicle.gForce = randomBetween(0.8, 1.1)
      vehicle.ear = randomBetween(0.28, 0.35)
      vehicle.perclos = randomBetween(2, 8)
      vehicle.crashDetected = false
      vehicle.sosSent = false
      vehicle.sosCountdown = 0
      sosCountdown = 0
      newGsmLog = []
      emergencyActive = false
      emergencyVehicleId = null
      addAlertLocal('info', vehicle.driverName, vehicle.id, 'Returned to normal driving state', 'CV')
      break

    case 'warning':
      vehicle.fatigueScore = randomBetween(75, 82)
      vehicle.ear = randomBetween(0.18, 0.24)
      vehicle.perclos = randomBetween(25, 40)
      addAlertLocal('warning', vehicle.driverName, vehicle.id, 'Fatigue warning threshold reached', 'CV')
      break

    case 'alarm':
      vehicle.fatigueScore = randomBetween(85, 89)
      vehicle.ear = randomBetween(0.12, 0.18)
      vehicle.perclos = randomBetween(45, 60)
      vehicle.blinkRate = randomInt(4, 8)
      addAlertLocal('alarm', vehicle.driverName, vehicle.id, 'ALARM: High fatigue detected!', 'CV')
      break

    case 'critical':
      vehicle.fatigueScore = randomBetween(90, 98)
      vehicle.ear = randomBetween(0.08, 0.14)
      vehicle.perclos = randomBetween(65, 85)
      vehicle.blinkRate = randomInt(2, 5)
      vehicle.headPose = { pitch: randomBetween(-25, -15), yaw: randomBetween(-20, -10), roll: randomBetween(-12, 12) }
      addAlertLocal('emergency', vehicle.driverName, vehicle.id, 'CRITICAL FATIGUE! Escalating to emergency.', 'CV')
      emergencyActive = true
      emergencyVehicleId = vehicle.id
      vehicle.sosCountdown = 8
      sosCountdown = 8
      break

    case 'crash':
      vehicle.gForce = randomBetween(3.5, 8.0)
      vehicle.gyroDps = randomBetween(220, 400)
      vehicle.speed = randomBetween(60, 90)
      vehicle.crashDetected = true
      vehicle.fatigueScore = randomBetween(70, 95)
      vehicle.sosCountdown = 8
      sosCountdown = 8
      emergencyActive = true
      emergencyVehicleId = vehicle.id
      addAlertLocal('emergency', vehicle.driverName, vehicle.id, 'CRASH-LIKE IMPACT DETECTED! Initiating SOS.', 'MPU6050')
      newGsmLog = [
        'AT',
        'OK',
        'AT+CMGF=1',
        'OK',
        `AT+CMGS="+2519XXXXXXXX"`,
        '> EMERGENCY ALERT! Possible crash or critical driver state detected.',
        `> Vehicle: ${vehicle.id}`,
        `> Driver: ${vehicle.driverName}`,
        `> G-Force: ${vehicle.gForce.toFixed(2)} G`,
        `> Location: ${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`,
        `> https://maps.google.com/?q=${vehicle.lat.toFixed(6)},${vehicle.lng.toFixed(6)}`,
        '> Ctrl+Z',
        'SOS MESSAGE SENT SUCCESSFULLY.',
      ]
      break

    case 'face_lost':
      vehicle.faceDetected = false
      vehicle.ear = 0
      vehicle.mar = 0
      vehicle.fatigueScore = randomBetween(70, 85)
      addAlertLocal('alarm', vehicle.driverName, vehicle.id, 'Face lost / camera blocked', 'CV')
      break

    case 'gps_fallback':
      addAlertLocal('warning', vehicle.driverName, vehicle.id, 'GPS signal lost. Using fallback coordinates.', 'GPS')
      break

    case 'sos_sent':
      vehicle.sosSent = true
      vehicle.sosCountdown = 0
      sosCountdown = 0
      newGsmLog = [
        'AT',
        'OK',
        'AT+CMGF=1',
        'OK',
        `AT+CMGS="+2519XXXXXXXX"`,
        '> EMERGENCY ALERT!',
        `> Vehicle: ${vehicle.id}`,
        `> Driver: ${vehicle.driverName}`,
        `> G-Force: ${vehicle.gForce.toFixed(2)} G`,
        `> Location: ${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`,
        '> Ctrl+Z',
        'SOS MESSAGE SENT SUCCESSFULLY.',
      ]
      addAlertLocal('emergency', vehicle.driverName, vehicle.id, 'SOS message sent to emergency services', 'GSM')
      break

    case 'mute':
      forceMuted = true
      vehicle.sosCountdown = 0
      sosCountdown = 0
      emergencyActive = false
      emergencyVehicleId = null
      addAlertLocal('info', vehicle.driverName, vehicle.id, 'Driver cancelled false alarm. System muted.', 'ESP32')
      break

    case 'reset':
      const resetIndex = DRIVERS.findIndex(d => d.vehicleId === vehicle.id)
      Object.assign(vehicle, createInitialVehicle(resetIndex >= 0 ? resetIndex : 0))
      emergencyActive = false
      emergencyVehicleId = null
      sosCountdown = 0
      newGsmLog = []
      break
  }

  // Evaluate new state
  let newState: DriverState
  if (forceMuted) {
    newState = 'MUTED'
  } else {
    newState = getStateFromFatigue(vehicle.fatigueScore, vehicle.crashDetected, vehicle.sosSent, false)
  }

  if (newState !== prevState) {
    newEvents.push({
      id: generateId(),
      timestamp: formatTimestamp(now),
      message: `STATE CHANGE: ${prevState} -> ${newState} (${vehicle.driverName})`,
      type: 'state_change',
    })
  }
  vehicle.state = newState
  vehicle.lastUpdate = now.toISOString()

  // Build new vehicles array with the updated vehicle
  const newVehicles = state.vehicles.map(v => v.id === vehicle.id ? vehicle : { ...v })

  return {
    ...state,
    vehicles: newVehicles,
    alerts: newAlerts,
    events: newEvents,
    gsmLog: newGsmLog,
    emergencyActive,
    emergencyVehicleId,
    sosCountdown,
  }
}

export function tickSimulation(state: SimulationState): SimulationState {
  const now = new Date()
  const timestamp = formatTimestamp(now)

  // Deep clone events so we never mutate the original
  const newEvents = [...state.events]
  let emergencyActive = state.emergencyActive
  let emergencyVehicleId = state.emergencyVehicleId

  const newVehicles = state.vehicles.map(vehicle => {
    const v = { ...vehicle }

    // If vehicle is MUTED, check if it should auto-recover
    if (v.state === 'MUTED') {
      // Stay muted unless fatigue drops very low — then auto-recover
      if (v.fatigueScore < 30 && !v.crashDetected) {
        newEvents.push({
          id: generateId(),
          timestamp,
          message: `System auto-returned to NORMAL (${v.driverName})`,
          type: 'info',
        })
        v.state = 'NORMAL'
        v.lastUpdate = now.toISOString()
      }
      return v
    }

    // Random walk for speed
    v.speed = clamp(v.speed + randomBetween(-3, 3), 0, 120)

    // If crash detected, speed drops
    if (v.crashDetected) {
      v.speed = clamp(v.speed - randomBetween(5, 15), 0, v.speed)
    }

    // Fatigue random walk (slow changes) — only when not in manual scenario control
    if (!v.crashDetected && v.state !== 'EMERGENCY') {
      v.fatigueScore = clamp(v.fatigueScore + randomBetween(-1, 1.5), 0, 100)
    }

    // EAR inversely correlates with fatigue
    const baseEar = 0.33
    v.ear = clamp(baseEar - (v.fatigueScore / 100) * 0.18 + randomBetween(-0.02, 0.02), 0.05, 0.4)

    // MAR slight variations
    v.mar = clamp(v.mar + randomBetween(-0.03, 0.03), 0.05, 0.6)

    // PERCLOS correlates with fatigue
    v.perclos = clamp(v.fatigueScore * 0.7 + randomBetween(-5, 5), 0, 100)

    // Blink rate decreases with fatigue
    v.blinkRate = Math.round(clamp(18 - (v.fatigueScore / 100) * 12 + randomBetween(-2, 2), 2, 25))

    // Head pose slight movements
    v.headPose = {
      pitch: clamp(v.headPose.pitch + randomBetween(-2, 2), -30, 30),
      yaw: clamp(v.headPose.yaw + randomBetween(-2, 2), -30, 30),
      roll: clamp(v.headPose.roll + randomBetween(-1, 1), -20, 20),
    }

    // G-force normal fluctuation
    if (!v.crashDetected) {
      v.gForce = clamp(v.gForce + randomBetween(-0.05, 0.05), 0.7, 1.8)
      v.gyroDps = clamp(v.gyroDps + randomBetween(-5, 5), 0, 60)
    }

    // Temperature slow changes
    v.temperature = clamp(v.temperature + randomBetween(-0.2, 0.2), 32, 42)

    // GPS movement (small position changes)
    v.lat = clamp(v.lat + randomBetween(-0.0005, 0.0005), 8.98, 9.08)
    v.lng = clamp(v.lng + randomBetween(-0.0005, 0.0005), 38.71, 38.82)

    // Auto-recover face detection after some time
    if (v.faceDetected === false && Math.random() > 0.97) {
      v.faceDetected = true
    }

    // Re-evaluate state
    const prevState = v.state
    const newStateVal = getStateFromFatigue(v.fatigueScore, v.crashDetected, v.sosSent, false)

    if (newStateVal !== prevState) {
      const eventMsg = `STATE CHANGE: ${prevState} -> ${newStateVal} (${v.driverName})`
      // Avoid duplicate consecutive state change events
      const lastEvent = newEvents[newEvents.length - 1]
      if (!lastEvent || lastEvent.message !== eventMsg) {
        newEvents.push({
          id: generateId(),
          timestamp,
          message: eventMsg,
          type: 'state_change',
        })
      }

      if (newStateVal === 'EMERGENCY' && prevState !== 'EMERGENCY') {
        emergencyActive = true
        emergencyVehicleId = v.id
        v.sosCountdown = 8
      }
    }

    v.state = newStateVal
    v.lastUpdate = now.toISOString()

    // Clear SOS countdown when not in emergency
    if (v.state !== 'EMERGENCY' && v.sosCountdown > 0) {
      v.sosCountdown = 0
    }

    return v
  })

  // Clean up old events
  const trimmedEvents = newEvents.length > 100 ? newEvents.slice(-100) : newEvents

  return {
    ...state,
    vehicles: newVehicles,
    events: trimmedEvents,
    emergencyActive,
    emergencyVehicleId,
  }
}

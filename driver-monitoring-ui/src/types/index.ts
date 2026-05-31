export type DriverState = 'NORMAL' | 'WARNING' | 'ALARM' | 'EMERGENCY' | 'MUTED'
export type AlertSeverity = 'info' | 'warning' | 'alarm' | 'emergency'
export type AlertSource = 'CV' | 'ESP32' | 'MPU6050' | 'GPS' | 'GSM'

export interface HeadPose {
  pitch: number
  yaw: number
  roll: number
}

export interface Driver {
  id: string
  name: string
  vehicleId: string
  route: string
}

export interface VehicleData {
  id: string
  driverId: string
  driverName: string
  speed: number
  fatigueScore: number
  gForce: number
  gyroDps: number
  temperature: number
  lat: number
  lng: number
  state: DriverState
  ear: number
  mar: number
  perclos: number
  blinkRate: number
  headPose: HeadPose
  faceDetected: boolean
  sosSent: boolean
  crashDetected: boolean
  sosCountdown: number
  lastUpdate: string
}

export interface Alert {
  id: string
  severity: AlertSeverity
  timestamp: string
  driverName: string
  vehicleId: string
  message: string
  source: AlertSource
  acknowledged: boolean
}

export interface EventLog {
  id: string
  timestamp: string
  message: string
  type: 'system' | 'state_change' | 'alert' | 'emergency' | 'info'
}

export interface SimulationState {
  vehicles: VehicleData[]
  alerts: Alert[]
  events: EventLog[]
  emergencyActive: boolean
  emergencyVehicleId: string | null
  selectedDriverId: string | null
  scenario: string
  sosCountdown: number
  gsmLog: string[]
}

export interface SimulationControls {
  scenario: 'normal' | 'warning' | 'alarm' | 'critical' | 'crash' | 'face_lost' | 'gps_fallback' | 'sos_sent' | 'mute' | 'reset'
  vehicleId: string
}

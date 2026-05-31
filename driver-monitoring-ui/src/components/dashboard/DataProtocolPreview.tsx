import { VehicleData } from '../../types'
import { FileText, Eye, Cpu } from 'lucide-react'

interface DataProtocolPreviewProps {
  vehicle: VehicleData
}

export default function DataProtocolPreview({ vehicle }: DataProtocolPreviewProps) {
  const cvPayload = {
    source: 'computer_vision',
    driverId: vehicle.driverId,
    ear: Number(vehicle.ear.toFixed(4)),
    mar: Number(vehicle.mar.toFixed(4)),
    perclos: Number(vehicle.perclos.toFixed(1)),
    blinkRate: vehicle.blinkRate,
    headPose: {
      pitch: Number(vehicle.headPose.pitch.toFixed(1)),
      yaw: Number(vehicle.headPose.yaw.toFixed(1)),
      roll: Number(vehicle.headPose.roll.toFixed(1)),
    },
    faceDetected: vehicle.faceDetected,
    fatigueScore: vehicle.fatigueScore,
    driverState: vehicle.state,
  }

  const embeddedPayload = {
    source: 'esp32',
    vehicleId: vehicle.id,
    speedKmph: Number(vehicle.speed.toFixed(1)),
    gForce: Number(vehicle.gForce.toFixed(2)),
    gyroDps: Number(vehicle.gyroDps.toFixed(1)),
    temperatureC: Number(vehicle.temperature.toFixed(1)),
    gpsValid: true,
    lat: Number(vehicle.lat.toFixed(6)),
    lng: Number(vehicle.lng.toFixed(6)),
    state: vehicle.state,
    sosSent: vehicle.sosSent,
  }

  return (
    <div className="glass-card-strong p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-white/50" />
        <span className="text-sm font-semibold">Live Data Protocol</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* CV JSON */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Computer Vision</span>
          </div>
          <pre className="text-[10px] font-mono text-white/40 leading-relaxed overflow-x-auto">
{`{
  "source": "computer_vision",
  "driverId": "${cvPayload.driverId}",
  "ear": ${cvPayload.ear},
  "mar": ${cvPayload.mar},
  "perclos": ${cvPayload.perclos},
  "blinkRate": ${cvPayload.blinkRate},
  "headPose": {
    "pitch": ${cvPayload.headPose.pitch},
    "yaw": ${cvPayload.headPose.yaw},
    "roll": ${cvPayload.headPose.roll}
  },
  "faceDetected": ${cvPayload.faceDetected},
  "fatigueScore": ${cvPayload.fatigueScore},
  "driverState": "${cvPayload.driverState}"
}`}
          </pre>
        </div>

        {/* Embedded JSON */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">ESP32 Embedded</span>
          </div>
          <pre className="text-[10px] font-mono text-white/40 leading-relaxed overflow-x-auto">
{`{
  "source": "esp32",
  "vehicleId": "${embeddedPayload.vehicleId}",
  "speedKmph": ${embeddedPayload.speedKmph},
  "gForce": ${embeddedPayload.gForce},
  "gyroDps": ${embeddedPayload.gyroDps},
  "temperatureC": ${embeddedPayload.temperatureC},
  "gpsValid": ${embeddedPayload.gpsValid},
  "lat": ${embeddedPayload.lat},
  "lng": ${embeddedPayload.lng},
  "state": "${embeddedPayload.state}",
  "sosSent": ${embeddedPayload.sosSent}
}`}
          </pre>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-[10px] text-white/30 leading-relaxed">
          <strong className="text-white/50">Privacy & Safety:</strong> All processing is local. Raw video is not stored.
          Only anonymized metrics and events are logged. This is an assistive prototype and not a certified automotive safety system.
        </p>
      </div>
    </div>
  )
}

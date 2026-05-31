import { cn } from '../../lib/utils'

interface GaugeProps {
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
  color?: string
  warningThreshold?: number
  alarmThreshold?: number
  animated?: boolean
}

export default function Gauge({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  className,
  color,
  warningThreshold = 75,
  alarmThreshold = 85,
  animated = true,
}: GaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min(value / maxValue, 1)
  const offset = circumference - percentage * circumference

  const getColor = () => {
    if (color) return color
    if (percentage >= 0.9) return '#ef4444'
    if (percentage >= 0.85) return '#f97316'
    if (percentage >= 0.75) return '#eab308'
    return '#22c55e'
  }

  const gaugeColor = getColor()

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={size} height={size} className={cn(animated && 'transition-all duration-500')}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Gauge arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${gaugeColor}40)`,
          }}
        />
        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {Math.round(value)}
        </text>
        {sublabel && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.14}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.4)"
            fontSize={size * 0.08}
            fontFamily="Montserrat, sans-serif"
          >
            {sublabel}
          </text>
        )}
      </svg>
      {label && (
        <span className="text-xs font-medium text-white/40 mt-2 tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  )
}

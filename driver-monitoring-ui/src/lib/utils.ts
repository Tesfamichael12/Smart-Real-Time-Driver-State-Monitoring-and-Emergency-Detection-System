export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatTimestampFull(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function getStateColor(state: string): string {
  switch (state) {
    case 'NORMAL': return '#22c55e'
    case 'WARNING': return '#eab308'
    case 'ALARM': return '#f97316'
    case 'EMERGENCY': return '#ef4444'
    case 'MUTED': return '#6b7280'
    default: return '#737373'
  }
}

export function getStateBadgeClass(state: string): string {
  switch (state) {
    case 'NORMAL': return 'state-normal'
    case 'WARNING': return 'state-warning'
    case 'ALARM': return 'state-alarm'
    case 'EMERGENCY': return 'state-emergency'
    case 'MUTED': return 'state-muted'
    default: return 'border border-white/10 text-white/50'
  }
}

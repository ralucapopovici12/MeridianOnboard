/** Initials for an avatar, e.g. "Alex Rivera" -> "AR". */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** 125 -> "2h 5m" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

/** ISO datetime -> "9:02 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Display label for a stored location ("Office" -> "On-site"). */
export function locationLabel(location: string): string {
  return location === 'Office' ? 'On-site' : location
}

/**
 * Where someone works on a given day, from their office-day numbers (1=Mon … 5=Fri).
 * Mirrors the backend's WorkSchedule: weekends and unset schedules count as Remote.
 */
export function scheduledLocation(
  officeDays: number[] | null,
  date: Date = new Date(),
): 'Office' | 'Remote' {
  const day = date.getDay() // 0=Sun … 6=Sat; Mon–Fri already match 1–5
  if (day === 0 || day === 6) return 'Remote'
  return officeDays?.includes(day) ? 'Office' : 'Remote'
}

/** "2026-06-29" -> "Jun 29, 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

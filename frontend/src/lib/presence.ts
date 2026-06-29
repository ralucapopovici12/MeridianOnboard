// Chat-style presence for the people directory. There's no real presence feed,
// so it's a stable per-person value (won't flicker between loads) and the signed-in
// user always reads as online.

export type Presence = 'online' | 'busy' | 'away' | 'offline'

// A fixed spread so the directory looks alive rather than all-green.
const STABLE: Presence[] = ['online', 'busy', 'away', 'online', 'offline', 'away', 'online', 'busy']

export function presenceFor(employeeId: number, isSelf: boolean): Presence {
  if (isSelf) return 'online'
  return STABLE[Math.abs(employeeId) % STABLE.length]
}

export const PRESENCE_LABEL: Record<Presence, string> = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline',
}

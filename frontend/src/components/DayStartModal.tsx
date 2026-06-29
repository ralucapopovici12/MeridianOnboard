import { useEffect, useState } from 'react'
import { Building2, House, Sun } from 'lucide-react'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { useTimesheet } from '../context/TimesheetContext'
import { locationLabel } from '../lib/format'

const LOCATIONS = ['Office', 'Remote'] as const

/** Today as yyyy-mm-dd in the user's local zone (for the once-per-day flag). */
function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * First login of the day: a centred prompt asking where the person is working
 * (On-site / Remote). Picking one clocks them in — that becomes their status for
 * the day. Shown once per person per day; it disappears once they've clocked in
 * and can be skipped (they can still use the header clock control any time).
 */
export function DayStartModal() {
  const { current } = useCurrentEmployee()
  const { sheet, loading, busy, clockIn } = useTimesheet()

  const [picked, setPicked] = useState<string>('Office')
  const [dismissed, setDismissed] = useState(false)

  const today = sheet?.today ?? null
  const storageKey = current ? `meridian.daystart:${current.id}:${todayKey()}` : null

  // Seed the selection with the schedule's suggestion for today.
  useEffect(() => {
    if (sheet && !today) setPicked(sheet.todayLocation)
  }, [sheet, today])

  if (loading || !sheet || !current) return null
  if (today) return null // already clocked in / status set for today
  if (dismissed) return null
  if (storageKey && localStorage.getItem(storageKey) === '1') return null

  const remember = () => storageKey && localStorage.setItem(storageKey, '1')

  async function confirm(loc: string) {
    await clockIn(loc)
    remember()
  }
  function skip() {
    remember()
    setDismissed(true)
  }

  return (
    <div className="daystart-overlay fade-in" role="dialog" aria-modal="true">
      <div className="daystart-card fade-up">
        <div className="daystart-eyebrow">
          <Sun size={14} /> {sheet.todayLabel}
        </div>
        <h2 className="daystart-title">Good to see you, {current.firstName}.</h2>
        <p className="daystart-sub">
          Where are you working today? This sets your status for the day.
        </p>

        <div className="daystart-options">
          {LOCATIONS.map((loc) => {
            const Icon = loc === 'Office' ? Building2 : House
            return (
              <button
                key={loc}
                type="button"
                className={`daystart-option${picked === loc ? ' daystart-option--on' : ''}`}
                aria-pressed={picked === loc}
                disabled={busy}
                onClick={() => setPicked(loc)}
              >
                <Icon size={22} />
                <span className="daystart-option__label">{locationLabel(loc)}</span>
                <span className="daystart-option__hint">
                  {loc === 'Office' ? 'In the office today' : 'Working from home'}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="btn-primary daystart-confirm"
          disabled={busy}
          onClick={() => confirm(picked)}
        >
          Start my day · {locationLabel(picked)}
        </button>
        <button type="button" className="daystart-skip" onClick={skip} disabled={busy}>
          Skip for now
        </button>
      </div>
    </div>
  )
}

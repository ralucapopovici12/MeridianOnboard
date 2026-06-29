import { useEffect, useRef, useState } from 'react'
import { Building2, House, MapPin } from 'lucide-react'
import { useTimesheet } from '../context/TimesheetContext'
import { locationLabel } from '../lib/format'

const LOCATIONS = ['Office', 'Remote'] as const

/**
 * Compact "today's status" control in the header. Shows where you're working
 * today (Office/Remote) and lets you switch it on the fly. We don't track hours,
 * so there's no timer or clock-in/out times — just the status.
 */
export function ClockControl() {
  const { sheet, busy, clockIn, setLocation } = useTimesheet()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const today = sheet?.today ?? null

  // Picker selection before a status is set — seeded with the schedule's suggestion.
  const [picked, setPicked] = useState<string>('Office')
  useEffect(() => {
    if (sheet && !today) setPicked(sheet.todayLocation)
  }, [sheet, today])

  // Close the popover on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!sheet) return null

  const triggerClass = `clock-pill${today ? ' clock-pill--live' : ''}`

  return (
    <div className="clock-control" ref={wrapRef}>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {today ? (
          <>
            <span className="clock-pill__dot" />
            <span className="clock-pill__loc">{locationLabel(today.location)}</span>
          </>
        ) : (
          <>
            <MapPin size={13} />
            <span>Set status</span>
          </>
        )}
      </button>

      {open && (
        <div className="clock-pop" role="dialog">
          {/* No status yet — pick today's location */}
          {!today && (
            <>
              <div className="clock-pop__title">Where are you working today?</div>
              <div className="clock-pop__sub">{sheet.todayLabel}</div>
              <LocationToggle value={picked} onChange={setPicked} />
              <button
                type="button"
                className="btn-primary clock-pop__action"
                disabled={busy}
                onClick={async () => {
                  await clockIn(picked)
                  setOpen(false)
                }}
              >
                <MapPin size={15} />
                Set status · {locationLabel(picked)}
              </button>
            </>
          )}

          {/* Status set — switch location any time */}
          {today && (
            <>
              <div className="clock-pop__title">Today&apos;s status</div>
              <div className="clock-pop__sub">{sheet.todayLabel}</div>
              <LocationToggle
                value={today.location}
                disabled={busy}
                onChange={(loc) => setLocation(loc)}
              />
              <div className="clock-pop__sub" style={{ marginTop: 12, marginBottom: 0 }}>
                Switch any time — we don&apos;t track hours.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LocationToggle({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (location: string) => void
  disabled?: boolean
}) {
  return (
    <div className="seg" role="group" aria-label="Working location">
      {LOCATIONS.map((loc) => {
        const Icon = loc === 'Office' ? Building2 : House
        return (
          <button
            key={loc}
            type="button"
            disabled={disabled}
            className={`seg__btn${value === loc ? ' seg__btn--on' : ''}`}
            aria-pressed={value === loc}
            onClick={() => onChange(loc)}
          >
            <Icon size={14} />
            {locationLabel(loc)}
          </button>
        )
      })}
    </div>
  )
}

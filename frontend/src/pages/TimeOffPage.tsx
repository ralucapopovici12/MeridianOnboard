import { useCallback, useEffect, useState } from 'react'
import { Building2, CalendarDays, House, Plus, Sun } from 'lucide-react'
import { api } from '../api/client'
import type { LeaveOverview, Week, WeekDay } from '../api/types'
import { LEAVE_EMOJI, LeaveRequestModal } from '../components/LeaveRequestModal'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { useTimesheet } from '../context/TimesheetContext'
import { formatDate } from '../lib/format'

function statusPill(status: string): string {
  switch (status) {
    case 'Approved': return 'pill pill--ok'
    case 'Pending': return 'pill pill--warn'
    case 'Declined': return 'pill pill--err'
    default: return 'pill pill--neutral' // Cancelled
  }
}

function DayCell({
  day,
  editable,
  busy,
  onSet,
}: {
  day: WeekDay
  editable: boolean
  busy: boolean
  onSet: (loc: string) => void
}) {
  const cls = [
    'week-day',
    day.isToday ? ' week-day--today' : '',
    day.onLeave ? ' week-day--leave' : '',
    day.location === 'Office' ? ' week-day--office' : '',
    day.location === 'Remote' ? ' week-day--remote' : '',
  ].join('')

  return (
    <div className={cls}>
      <div className="week-day__name">{day.dayName}</div>
      <div className="week-day__date">{day.dayLabel}</div>

      {day.onLeave ? (
        <div className="week-day__status week-day__status--leave">🌴 Leave</div>
      ) : day.location ? (
        <div className="week-day__status">
          {day.location === 'Office' ? <Building2 size={13} /> : <House size={13} />}
          {day.location}
        </div>
      ) : (
        <div className="week-day__status week-day__status--empty">—</div>
      )}

      {editable && !day.onLeave && (
        <div className="week-day__toggle">
          <button
            className={`week-day__opt${day.location === 'Office' ? ' week-day__opt--on' : ''}`}
            disabled={busy}
            onClick={() => onSet('Office')}
          >
            Office
          </button>
          <button
            className={`week-day__opt${day.location === 'Remote' ? ' week-day__opt--on' : ''}`}
            disabled={busy}
            onClick={() => onSet('Remote')}
          >
            Remote
          </button>
        </div>
      )}
    </div>
  )
}

export function TimeOffPage() {
  const { currentId, current } = useCurrentEmployee()
  const { sheet, busy, clockIn, setLocation } = useTimesheet()

  const [week, setWeek] = useState<Week | null>(null)
  const [overview, setOverview] = useState<LeaveOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    if (currentId == null) return
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([api.getWeek(currentId), api.getLeave(currentId)])
      .then(([w, o]) => {
        if (!active) return
        setWeek(w)
        setOverview(o)
      })
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentId])

  useEffect(load, [load])

  const reloadWeek = useCallback(() => {
    if (currentId == null) return
    api.getWeek(currentId).then(setWeek).catch(() => {})
  }, [currentId])

  // Set today's location from the week strip, then refresh the week.
  async function setToday(loc: string) {
    if (sheet?.today) await setLocation(loc)
    else await clockIn(loc)
    reloadWeek()
  }

  async function cancelRequest(id: number) {
    try {
      setOverview(await api.cancelLeave(id))
      reloadWeek()
    } catch {
      /* ignore */
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading time off…</p>
  if (error) return <p style={{ color: 'var(--err)', fontSize: 14 }}>{error}</p>
  if (!week || !overview || !current) return null

  const remaining = week.officeTarget - week.officeCount
  const met = week.officeCount >= week.officeTarget

  return (
    <div>
      <div className="page-header-row fade-up" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Time Off</h1>
          <p className="page-sub">Your week, your leave balances, and your requests.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} />
          Request time off
        </button>
      </div>

      {/* ===== THIS WEEK — 3 days in office ===== */}
      <div className="task-section__label" style={{ marginBottom: 12 }}>
        <span>
          <CalendarDays size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
          This week
        </span>
        <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>{week.weekLabel}</span>
      </div>

      <div
        className="glass-card glass-card--solid glass-card--no-hover anim-slide-up"
        style={{ padding: '20px 22px', marginBottom: 14 }}
      >
        <div className="week-goal">
          <div className="week-goal__text">
            <span
              className="week-goal__count"
              style={{ color: met ? 'var(--ok)' : 'var(--warn)' }}
            >
              {week.officeCount} / {week.officeTarget}
            </span>
            <span className="week-goal__label">
              office days this week
              {met ? ' · target met ✓' : ` · ${remaining} more to go`}
            </span>
          </div>
          <div className="week-goal__dots">
            {Array.from({ length: week.officeTarget }).map((_, i) => (
              <span
                key={i}
                className={`week-goal__dot${i < week.officeCount ? ' week-goal__dot--on' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="week-grid">
          {week.days.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              editable={day.isToday}
              busy={busy}
              onSet={setToday}
            />
          ))}
        </div>

        <p className="week-note">
          <Sun size={12} style={{ marginRight: 5, verticalAlign: '-1px' }} />
          Set today from here or the header. Leave days don’t count toward the 3.
        </p>
      </div>

      {/* ===== BALANCES ===== */}
      <div className="task-section__label" style={{ margin: '32px 0 12px' }}>
        <span>Leave balances</span>
        <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>this year</span>
      </div>

      <div className="balance-grid anim-slide-up">
        {overview.balances.map((b) => (
          <div key={b.type} className="balance-card">
            <div className="balance-card__top">
              <span className="balance-card__emoji">{LEAVE_EMOJI[b.type] ?? '📅'}</span>
              <span className="balance-card__label">{b.label}</span>
            </div>
            {b.entitlement != null ? (
              <>
                <div className="balance-card__value">
                  {b.remaining}
                  <span className="balance-card__unit"> / {b.entitlement} left</span>
                </div>
                <div className="balance-card__meta">{b.used} used</div>
              </>
            ) : (
              <>
                <div className="balance-card__value balance-card__value--muted">As needed</div>
                <div className="balance-card__meta">{b.used} used this year</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ===== MY REQUESTS ===== */}
      <div className="task-section__label" style={{ margin: '32px 0 12px' }}>
        <span>My requests</span>
        <span style={{ opacity: 0.6 }}>{overview.requests.length}</span>
      </div>

      {overview.requests.length === 0 ? (
        <div
          className="glass-card glass-card--solid glass-card--no-hover"
          style={{ padding: '40px 24px', textAlign: 'center' }}
        >
          <CalendarDays className="empty-state__icon" size={32} />
          <p className="empty-state__title">No requests yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Use “Request time off” to submit your first one.
          </p>
        </div>
      ) : (
        <div className="hire-table anim-slide-up">
          {overview.requests.map((r) => {
            const canCancel = r.status === 'Pending' || r.status === 'Approved'
            return (
              <div key={r.id} className="hire-table__row leave-row">
                <span className="leave-row__emoji">{LEAVE_EMOJI[r.type] ?? '📅'}</span>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <div className="leave-row__type">{r.typeLabel}</div>
                  <div className="leave-row__dates">
                    {formatDate(r.startDate)}
                    {r.startDate !== r.endDate && ` – ${formatDate(r.endDate)}`}
                    {' · '}
                    {r.days} day{r.days === 1 ? '' : 's'}
                    {r.note && <span className="leave-row__note"> · {r.note}</span>}
                  </div>
                </div>
                <span className={statusPill(r.status)}>{r.status}</span>
                {canCancel ? (
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => cancelRequest(r.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <span style={{ width: 62 }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <LeaveRequestModal
          employeeId={current.id}
          balances={overview.balances}
          onClose={() => setModalOpen(false)}
          onSubmitted={(o) => {
            setOverview(o)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

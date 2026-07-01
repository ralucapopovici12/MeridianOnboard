import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../api/client'
import type { LeaveBalance, LeaveOverview } from '../api/types'

/** Emoji per leave type — shared with the Time Off page. */
export const LEAVE_EMOJI: Record<string, string> = {
  Annual: '🌴',
  Sick: '🤒',
  BloodDonation: '🩸',
  Personal: '💼',
  Parental: '👶',
  Bereavement: '🕯️',
  Marriage: '💍',
  Study: '📚',
}

/** yyyy-mm-dd for today, in local time. */
function todayIso(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Weekdays (Mon–Fri) between two ISO dates, inclusive. */
function workingDays(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  if (e < s) return 0
  let n = 0
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) n++
  }
  return n
}

export function LeaveRequestModal({
  employeeId,
  balances,
  onClose,
  onSubmitted,
}: {
  employeeId: number
  balances: LeaveBalance[]
  onClose: () => void
  onSubmitted: (overview: LeaveOverview) => void
}) {
  const [type, setType] = useState(balances[0]?.type ?? 'Annual')
  const [start, setStart] = useState(todayIso())
  const [end, setEnd] = useState(todayIso())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const days = workingDays(start, end)
  const invalid = end < start || days === 0

  async function submit() {
    if (busy || invalid) return
    setBusy(true)
    setError(null)
    try {
      const overview = await api.createLeave(employeeId, {
        type,
        startDate: start,
        endDate: end,
        note: note.trim() || null,
      })
      onSubmitted(overview)
    } catch {
      setError('Could not submit the request. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="leave-modal__overlay fade-in" role="dialog" aria-modal="true">
      <div className="leave-modal fade-up">
        <button className="leave-modal__close" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </button>

        <h2 className="leave-modal__title">Request time off</h2>
        <p className="leave-modal__sub">Submit a request — HR will review and approve it.</p>

        <label className="leave-modal__label" htmlFor="leave-type">Type</label>
        <select
          id="leave-type"
          className="leave-modal__input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {balances.map((b) => (
            <option key={b.type} value={b.type}>
              {LEAVE_EMOJI[b.type] ?? ''} {b.label}
            </option>
          ))}
        </select>

        <div className="leave-modal__row">
          <div style={{ flex: 1 }}>
            <label className="leave-modal__label" htmlFor="leave-start">From</label>
            <input
              id="leave-start"
              type="date"
              className="leave-modal__input"
              value={start}
              onChange={(e) => {
                setStart(e.target.value)
                if (end < e.target.value) setEnd(e.target.value)
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="leave-modal__label" htmlFor="leave-end">To</label>
            <input
              id="leave-end"
              type="date"
              className="leave-modal__input"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <label className="leave-modal__label" htmlFor="leave-note">Note (optional)</label>
        <textarea
          id="leave-note"
          className="leave-modal__input leave-modal__textarea"
          rows={2}
          value={note}
          placeholder="Anything HR should know…"
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="leave-modal__foot">
          <span className="leave-modal__days">
            {invalid ? 'Pick a valid range' : `${days} working day${days === 1 ? '' : 's'}`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={busy || invalid}>
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--err)', fontSize: 12.5, marginTop: 10 }}>{error}</p>
        )}
      </div>
    </div>
  )
}

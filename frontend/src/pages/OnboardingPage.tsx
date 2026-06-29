import { useCallback, useEffect, useState } from 'react'
import { Check, ClipboardList } from 'lucide-react'
import { api } from '../api/client'
import type { EmployeeChecklist } from '../api/types'
import { PhaseCarousel } from '../components/PhaseCarousel'
import { TrainingSection } from '../components/TrainingSection'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { formatDate } from '../lib/format'

function recompute(cl: EmployeeChecklist, taskId: number): EmployeeChecklist {
  const groups = cl.groups.map((g) => {
    const tasks = g.tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t,
    )
    return { ...g, tasks, completed: tasks.filter((t) => t.isCompleted).length }
  })
  const total     = groups.reduce((n, g) => n + g.total, 0)
  const completed = groups.reduce((n, g) => n + g.completed, 0)
  const percent   = total === 0 ? 0 : Math.round((100 * completed) / total)
  return { ...cl, groups, progress: { completed, total, percent } }
}

function fillClass(pct: number) {
  if (pct >= 100) return 'prog-fill prog-fill--ok'
  if (pct >= 60)  return 'prog-fill prog-fill--gradient'
  if (pct >= 30)  return 'prog-fill prog-fill--warn'
  return 'prog-fill prog-fill--err'
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function OnboardingPage() {
  const { currentId, current } = useCurrentEmployee()
  const [cl, setCl]           = useState<EmployeeChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [officeDays, setOfficeDays]       = useState<number[]>([])
  const [scheduleSaved, setScheduleSaved] = useState(false)

  useEffect(() => {
    if (cl) {
      setOfficeDays(cl.officeDays ?? [])
      setScheduleSaved((cl.officeDays?.length ?? 0) === 3)
    }
  }, [cl?.employeeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(() => {
    if (currentId == null) return
    let active = true
    setLoading(true); setError(null)
    api.getChecklist(currentId)
      .then((d) => active && setCl(d))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [currentId])

  useEffect(load, [load])

  async function toggleDay(day: number) {
    if (!cl) return
    const next = officeDays.includes(day)
      ? officeDays.filter(d => d !== day)
      : officeDays.length < 3 ? [...officeDays, day] : officeDays

    if (next === officeDays) return
    setOfficeDays(next)
    setScheduleSaved(false)

    if (next.length === 3) {
      try {
        await api.updateSchedule(cl.employeeId, next)
        setScheduleSaved(true)
      } catch { /* silent — UI already shows the selection */ }
    }
  }

  async function toggle(taskId: number) {
    if (!cl) return
    const prev = cl
    setCl(recompute(cl, taskId))
    try { await api.toggleTask(taskId) }
    catch { setCl(prev) }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading checklist…</p>
  if (error)   return <p style={{ color: 'var(--err)',       fontSize: 14 }}>{error}</p>
  if (!cl || !current) return null

  if (cl.groups.length === 0) {
    return (
      <div className="glass-card glass-card--solid glass-card--no-hover" style={{ padding: '56px 32px', textAlign: 'center' }}>
        <ClipboardList className="empty-state__icon" size={36} />
        <p className="empty-state__title">No onboarding checklist</p>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
          {current.fullName} isn&apos;t a current new hire. Use &ldquo;Viewing as&rdquo; in the nav to pick a new hire.
        </p>
      </div>
    )
  }

  const { progress } = cl

  return (
    <div>
      {/* Welcome header with glowing semicircle arc */}
      <div className="onboarding-hero">
        <div className="onboarding-hero__arc" aria-hidden="true" />
        <div className="onboarding-hero__content page-header-row fade-up">
          <div>
            <h1 className="page-title">Welcome, {current.firstName}.</h1>
            <p className="page-sub">
              {current.role} · {current.department} · Starts {formatDate(current.startDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress hero */}
      <div className="prog-hero anim-slide-up" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="prog-hero__label">First month progress</div>
            <div className="prog-hero__number">{progress.percent}<span style={{ fontSize: 20, fontWeight: 500, opacity: 0.5, marginLeft: 2 }}>%</span></div>
          </div>
          <span className="prog-hero__meta">
            {progress.completed} of {progress.total} tasks complete
          </span>
        </div>
        <div className="prog-track">
          <div
            className={fillClass(progress.percent)}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Phase overview */}
      <div className="anim-slide-up delay-100" style={{ marginBottom: 32 }}>
        <PhaseCarousel groups={cl.groups} />
      </div>

      {/* Mandatory training & acknowledgements */}
      <TrainingSection employeeId={cl.employeeId} />

      {/* Task groups */}
      {cl.groups.map((group, gi) => (
        <div
          key={group.phase}
          className="task-section anim-slide-up"
          style={{ animationDelay: `${160 + gi * 55}ms` }}
        >
          <div className="task-section__label">
            <span>{group.label}</span>
            <span style={{ opacity: 0.6 }}>{group.completed}/{group.total}</span>
          </div>

          <ul className="task-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {group.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="task-row"
                  onClick={() => toggle(task.id)}
                >
                  <span className={`task-toggle${task.isCompleted ? ' task-toggle--done' : ''}`}>
                    {task.isCompleted && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={`task-label${task.isCompleted ? ' task-label--done' : ''}`}>
                    {task.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Hybrid schedule picker */}
      <div
        className="task-section anim-slide-up"
        style={{ animationDelay: `${160 + cl.groups.length * 55 + 55}ms` }}
      >
        <div className="task-section__label">
          <span>Work Schedule</span>
          {scheduleSaved && (
            <span style={{ color: 'var(--ok)', fontSize: 11, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
              Saved
            </span>
          )}
        </div>

        <div className="glass-card glass-card--solid glass-card--no-hover" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.55 }}>
            Meridian's hybrid policy is{' '}
            <strong style={{ color: 'var(--text)' }}>3 days in office</strong> and 2 days remote.
            Select your in-office days below.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_LABELS.map((label, i) => {
              const day     = i + 1
              const isOffice  = officeDays.includes(day)
              const isDisabled = !isOffice && officeDays.length >= 3
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  disabled={isDisabled}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: 'var(--r-md)',
                    border: isOffice
                      ? '1px solid rgba(107,63,255,0.50)'
                      : '1px solid var(--border)',
                    background: isOffice
                      ? 'var(--accent-soft)'
                      : 'rgba(255,255,255,0.03)',
                    color: isOffice ? 'var(--accent-bright)' : 'var(--text-subtle)',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.35 : 1,
                    transition: 'all var(--t-fast)',
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  <div>{label}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 4, opacity: 0.8 }}>
                    {isOffice ? 'Office' : 'Remote'}
                  </div>
                </button>
              )
            })}
          </div>

          {officeDays.length < 3 && (
            <p style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 12, marginBottom: 0 }}>
              Select {3 - officeDays.length} more day{3 - officeDays.length !== 1 ? 's' : ''} to complete your schedule
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

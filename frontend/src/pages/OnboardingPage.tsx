import { useCallback, useEffect, useState } from 'react'
import { Check, ClipboardList, Sparkles } from 'lucide-react'
import { api } from '../api/client'
import type { EmployeeChecklist } from '../api/types'
import { PhaseCarousel } from '../components/PhaseCarousel'
import { TrainingSection } from '../components/TrainingSection'
import { GuidedTour, useGuidedTour, type TourStep } from '../components/GuidedTour'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { formatDate } from '../lib/format'

const ONBOARDING_TOUR: TourStep[] = [
  {
    title: 'Welcome to your onboarding 👋',
    body: 'Here’s a quick tour of your first month at Meridian.',
  },
  {
    target: 'ob-progress',
    title: 'Your progress',
    body: 'See how far you are through your first-month checklist at a glance.',
  },
  {
    target: 'ob-phases',
    title: 'Three phases',
    body: 'Your month is split into Pre-Day 1, Week 1, and Weeks 2–4.',
  },
  {
    target: 'ob-training',
    title: 'Mandatory videos',
    body: 'Watch the required training videos and acknowledge the policy docs here — a few are mandatory before your first day.',
    hint: true,
  },
  {
    target: 'ob-tasks',
    title: 'Tick tasks off',
    body: 'Click any task to mark it done — your progress updates instantly.',
    hint: true,
  },
  {
    title: 'You’re ready!',
    body: 'Work through the checklist at your own pace. Welcome aboard!',
  },
]

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

export function OnboardingPage() {
  const { currentId, current } = useCurrentEmployee()
  const [cl, setCl]           = useState<EmployeeChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

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

  // First-visit walkthrough (runs once the checklist has loaded).
  const tour = useGuidedTour(currentId != null ? `meridian.tour.onboarding.${currentId}` : null)
  const { autoStartIfNew } = tour
  useEffect(() => {
    if (cl && cl.groups.length > 0) autoStartIfNew()
  }, [cl, autoStartIfNew])

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
            <button className="tour-launch" style={{ marginTop: 12 }} onClick={tour.start}>
              <Sparkles size={12} />
              Take a tour
            </button>
          </div>
        </div>
      </div>

      {/* Progress hero */}
      <div className="prog-hero anim-slide-up" data-tour="ob-progress" style={{ marginBottom: 28 }}>
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
      <div className="anim-slide-up delay-100" data-tour="ob-phases" style={{ marginBottom: 32 }}>
        <PhaseCarousel groups={cl.groups} />
      </div>

      {/* Mandatory training & acknowledgements */}
      <TrainingSection employeeId={cl.employeeId} />

      {/* Task groups */}
      {cl.groups.map((group, gi) => (
        <div
          key={group.phase}
          className="task-section anim-slide-up"
          data-tour={gi === 0 ? 'ob-tasks' : undefined}
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

      {tour.open && <GuidedTour steps={ONBOARDING_TOUR} onClose={tour.close} />}
    </div>
  )
}

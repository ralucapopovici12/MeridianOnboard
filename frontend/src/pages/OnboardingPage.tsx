import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react'
import { api } from '../api/client'
import type { EmployeeChecklist } from '../api/types'
import { PhaseCarousel } from '../components/PhaseCarousel'
import { ProgressBar } from '../components/ProgressBar'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { formatDate } from '../lib/format'

/** Recomputes group and overall counts after a task is toggled locally. */
function recompute(checklist: EmployeeChecklist, taskId: number): EmployeeChecklist {
  const groups = checklist.groups.map((group) => {
    const tasks = group.tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t,
    )
    return { ...group, tasks, completed: tasks.filter((t) => t.isCompleted).length }
  })
  const total = groups.reduce((n, g) => n + g.total, 0)
  const completed = groups.reduce((n, g) => n + g.completed, 0)
  const percent = total === 0 ? 0 : Math.round((100 * completed) / total)
  return { ...checklist, groups, progress: { completed, total, percent } }
}

export function OnboardingPage() {
  const { currentId, current } = useCurrentEmployee()
  const [checklist, setChecklist] = useState<EmployeeChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (currentId == null) return
    let active = true
    setLoading(true)
    setError(null)
    api
      .getChecklist(currentId)
      .then((data) => active && setChecklist(data))
      .catch((e: unknown) =>
        active && setError(e instanceof Error ? e.message : 'Failed to load checklist'),
      )
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentId])

  useEffect(load, [load])

  async function toggle(taskId: number) {
    if (!checklist) return
    const previous = checklist
    setChecklist(recompute(checklist, taskId)) // optimistic
    try {
      await api.toggleTask(taskId)
    } catch {
      setChecklist(previous) // revert on failure
    }
  }

  if (loading) return <Centered>Loading checklist…</Centered>
  if (error) return <Centered tone="error">{error}</Centered>
  if (!checklist || !current) return null

  if (checklist.groups.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-lg font-semibold text-slate-700">No onboarding checklist</h2>
        <p className="mt-1 text-sm text-slate-500">
          {current.fullName} isn&apos;t a current new hire. Pick a new hire from the
          “I am” menu to see their first-month checklist.
        </p>
      </div>
    )
  }

  const { progress } = checklist

  return (
    <div className="space-y-6">
      <div className="anim-slide-up">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {current.firstName}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {current.role} · {current.department} · Starts {formatDate(current.startDate)}
        </p>
      </div>

      <PhaseCarousel groups={checklist.groups} />

      <div className="rounded-xl border border-slate-200 bg-white p-5 anim-slide-up delay-200">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Your first month</div>
            <div className="text-3xl font-bold text-slate-800">{progress.percent}%</div>
          </div>
          <div className="text-sm text-slate-500">
            {progress.completed} of {progress.total} tasks done
          </div>
        </div>
        <ProgressBar percent={progress.percent} className="mt-3" />
      </div>

      {checklist.groups.map((group) => (
        <section key={group.phase}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </h2>
            <span className="text-xs text-slate-400">
              {group.completed}/{group.total}
            </span>
          </div>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {group.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 anim-bounce-in" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                  )}
                  <span
                    className={
                      task.isCompleted
                        ? 'text-slate-400 line-through'
                        : 'text-slate-700'
                    }
                  >
                    {task.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Centered({
  children,
  tone = 'normal',
}: {
  children: React.ReactNode
  tone?: 'normal' | 'error'
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-10 text-center text-sm ${
        tone === 'error'
          ? 'border-rose-200 text-rose-600'
          : 'border-slate-200 text-slate-500'
      }`}
    >
      {children}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { CalendarClock, TrendingUp, Users } from 'lucide-react'
import { api } from '../api/client'
import type { HrOverviewItem } from '../api/types'
import { Avatar } from '../components/Avatar'
import { ProgressBar } from '../components/ProgressBar'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { useAsync } from '../lib/useAsync'

export function HrDashboardPage() {
  const { data, loading, error } = useAsync(() => api.getHrOverview(), [])
  const { setCurrentId } = useCurrentEmployee()
  const navigate = useNavigate()

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard…</p>
  if (error) return <p className="text-sm text-rose-600">{error}</p>

  const hires = data ?? []
  const avgProgress =
    hires.length === 0
      ? 0
      : Math.round(hires.reduce((n, h) => n + h.progress.percent, 0) / hires.length)
  const startingSoon = hires.filter((h) => h.daysToStart >= 0).length

  function openChecklist(employeeId: number) {
    setCurrentId(employeeId)
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">HR Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every current new hire and how far through onboarding they are — one screen
          for Meridian&apos;s single HR person.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />}        label="New hires onboarding" value={hires.length}      delay={0} />
        <Stat icon={<TrendingUp className="h-5 w-5" />}   label="Average progress"     value={`${avgProgress}%`} delay={100} />
        <Stat icon={<CalendarClock className="h-5 w-5" />} label="Yet to start"        value={startingSoon}       delay={200} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {hires.map((hire) => (
          <HireRow key={hire.employeeId} hire={hire} onOpen={openChecklist} />
        ))}
        {hires.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">
            No one is currently onboarding.
          </p>
        )}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  delay?: number
}) {
  return (
    <div
      className="stat-card anim-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="icon-btn flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function HireRow({
  hire,
  onOpen,
}: {
  hire: HrOverviewItem
  onOpen: (employeeId: number) => void
}) {
  const upcoming = hire.daysToStart >= 0
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0">
      <Avatar name={hire.fullName} size="md" />

      <div className="min-w-[10rem] flex-1">
        <div className="font-semibold text-slate-800">{hire.fullName}</div>
        <div className="text-sm text-slate-500">
          {hire.role} · {hire.department}
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            upcoming ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
          }`}
        >
          {hire.status}
        </span>
        <span className="text-xs text-slate-400">Next: {hire.currentPhaseLabel}</span>
      </div>

      <div className="w-40">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{hire.progress.percent}%</span>
          <span>
            {hire.progress.completed}/{hire.progress.total}
          </span>
        </div>
        <ProgressBar percent={hire.progress.percent} />
      </div>

      <button
        type="button"
        onClick={() => onOpen(hire.employeeId)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        View checklist
      </button>
    </div>
  )
}

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

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
  if (error)   return <p style={{ color: 'var(--err)',       fontSize: 14 }}>{error}</p>

  const hires = data ?? []
  const avg = hires.length
    ? Math.round(hires.reduce((s, h) => s + h.progress.percent, 0) / hires.length)
    : 0
  const startingSoon = hires.filter((h) => h.daysToStart >= 0).length

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-sub">Onboarding progress across all new hires.</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid">
        <KpiCard value={hires.length} label="Hires onboarding" Icon={Users}        delay={0} />
        <KpiCard value={`${avg}%`}    label="Average progress" Icon={TrendingUp}   delay={60} />
        <KpiCard value={startingSoon} label="Yet to start"     Icon={CalendarClock} delay={120} />
      </div>

      {/* Table */}
      <div className="hire-table anim-slide-up delay-200">
        <div className="hire-table__head">
          <span className="hire-table__head-title">New Hires</span>
          <span className="pill pill--accent">{hires.length} active</span>
        </div>

        {hires.length === 0 && (
          <div className="empty-state">
            <p>No one is currently onboarding.</p>
          </div>
        )}

        {hires.map((hire) => (
          <HireRow
            key={hire.employeeId}
            hire={hire}
            onOpen={(id) => { setCurrentId(id); navigate('/') }}
          />
        ))}
      </div>
    </div>
  )
}

function KpiCard({
  value, label, Icon, delay,
}: {
  value: React.ReactNode
  label: string
  Icon: React.ElementType
  delay: number
}) {
  return (
    <div className="kpi-card anim-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
      <Icon size={28} className="kpi-card__icon" />
    </div>
  )
}

function HireRow({
  hire, onOpen,
}: {
  hire: HrOverviewItem
  onOpen: (id: number) => void
}) {
  const upcoming = hire.daysToStart >= 0
  return (
    <div className="hire-table__row">
      <Avatar name={hire.fullName} size="md" />

      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          {hire.fullName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
          {hire.role} · {hire.department}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
        <span className={upcoming ? 'pill pill--warn' : 'pill pill--accent'}>{hire.status}</span>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
          Next: {hire.currentPhaseLabel}
        </span>
      </div>

      <div style={{ width: 148 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>{hire.progress.percent}%</span>
          <span style={{ color: 'var(--text-subtle)' }}>{hire.progress.completed}/{hire.progress.total}</span>
        </div>
        <ProgressBar percent={hire.progress.percent} />
      </div>

      <button
        type="button"
        className="btn-ghost"
        style={{ marginLeft: 'auto', fontSize: 12 }}
        onClick={() => onOpen(hire.employeeId)}
      >
        View checklist
      </button>
    </div>
  )
}

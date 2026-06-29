import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CalendarClock,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
  Video,
  X,
} from 'lucide-react'
import { api } from '../api/client'
import type { Employee, HrOverviewItem } from '../api/types'
import { Avatar } from '../components/Avatar'
import { ProgressBar } from '../components/ProgressBar'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { useAsync } from '../lib/useAsync'

const FIRST_MONTH_DAYS = 28

/** Bucket a job title into a seniority band ("încadrare"). */
function seniority(role: string): string {
  const r = role.toLowerCase()
  if (/director|manager|lead|head/.test(r)) return 'Lead / Manager'
  if (/senior|principal|staff/.test(r)) return 'Senior'
  if (/junior|associate|representative|intern|trainee/.test(r)) return 'Junior'
  return 'Mid'
}

/** Whether a hire needs an HR nudge, with a short reason. */
function attentionFor(hire: HrOverviewItem): string | null {
  if (hire.daysToStart >= 0) {
    return hire.daysToStart <= 3 ? `Starts in ${hire.daysToStart}d — prep accounts & equipment` : null
  }
  const daysSince = -hire.daysToStart
  const expected = Math.min(100, Math.round((daysSince / FIRST_MONTH_DAYS) * 100))
  if (hire.progress.percent + 15 < expected) {
    return `Behind pace — ${hire.progress.percent}% at day ${daysSince}`
  }
  return null
}

export function HrDashboardPage() {
  const { data, loading, error } = useAsync(() => api.getHrOverview(), [])
  const { employees, setCurrentId } = useCurrentEmployee()
  const navigate = useNavigate()
  const [dept, setDept] = useState<string | null>(null)

  const hires = useMemo(() => data ?? [], [data])

  // Company-at-a-glance, all derived from the real directory.
  const stats = useMemo(() => {
    const byDept = new Map<string, { count: number; onboarding: number }>()
    for (const e of employees) {
      const row = byDept.get(e.department) ?? { count: 0, onboarding: 0 }
      row.count++
      if (e.isNewHire) row.onboarding++
      byDept.set(e.department, row)
    }
    const departments = [...byDept.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)

    const bands = ['Lead / Manager', 'Senior', 'Mid', 'Junior']
    const seniorityMix = bands
      .map((band) => ({ band, count: employees.filter((e) => seniority(e.role) === band).length }))
      .filter((b) => b.count > 0)

    const scheduled = employees.filter((e) => e.officeDays && e.officeDays.length > 0)
    const officeRatio = scheduled.length
      ? Math.round(
          (scheduled.reduce((s, e) => s + (e.officeDays?.length ?? 0), 0) / (scheduled.length * 5)) *
            100,
        )
      : 0

    return {
      headcount: employees.length,
      teams: departments.length,
      maxDept: departments[0]?.count ?? 1,
      departments,
      seniorityMix,
      maxBand: Math.max(1, ...seniorityMix.map((b) => b.count)),
      officeRatio,
      notScheduled: employees.length - scheduled.length,
    }
  }, [employees])

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
  if (error) return <p style={{ color: 'var(--err)', fontSize: 14 }}>{error}</p>

  const avg = hires.length
    ? Math.round(hires.reduce((s, h) => s + h.progress.percent, 0) / hires.length)
    : 0
  const needAttention = hires.filter((h) => attentionFor(h) !== null).length
  const visibleHires = dept ? hires.filter((h) => h.department === dept) : hires
  const empById = (id: number) => employees.find((e) => e.id === id)

  return (
    <div className="fade-up">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-sub">The company at a glance, and every new hire's first month.</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid">
        <KpiCard value={stats.headcount} label="Total headcount" Icon={Users} delay={0} />
        <KpiCard value={stats.teams} label="Teams" Icon={Building2} delay={50} />
        <KpiCard value={hires.length} label="Onboarding now" Icon={CalendarClock} delay={100} />
        <KpiCard value={`${avg}%`} label="Avg onboarding" Icon={TrendingUp} delay={150} />
      </div>

      {/* Company at a glance */}
      <div className="stats-grid anim-slide-up delay-100">
        <div className="stat-card">
          <div className="stat-card__title">
            <span>Headcount by team</span>
            {dept && (
              <button type="button" className="stat-card__clear" onClick={() => setDept(null)}>
                <X size={11} /> clear filter
              </button>
            )}
          </div>
          <div className="dept-list">
            {stats.departments.map((d) => (
              <button
                key={d.name}
                type="button"
                className={`dept-row${dept === d.name ? ' dept-row--active' : ''}`}
                onClick={() => setDept((cur) => (cur === d.name ? null : d.name))}
                title={`Filter new hires to ${d.name}`}
              >
                <span className="dept-row__name">{d.name}</span>
                <span className="dept-bar">
                  <span
                    className="dept-bar__fill"
                    style={{ width: `${Math.round((d.count / stats.maxDept) * 100)}%` }}
                  />
                </span>
                <span className="dept-row__count">
                  {d.count}
                  {d.onboarding > 0 && <span className="dept-row__sub">{d.onboarding} onboarding</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__title">
            <span>Seniority mix</span>
          </div>
          <div className="dept-list">
            {stats.seniorityMix.map((b) => (
              <div key={b.band} className="dept-row dept-row--static">
                <span className="dept-row__name">{b.band}</span>
                <span className="dept-bar">
                  <span
                    className="dept-bar__fill dept-bar__fill--alt"
                    style={{ width: `${Math.round((b.count / stats.maxBand) * 100)}%` }}
                  />
                </span>
                <span className="dept-row__count">{b.count}</span>
              </div>
            ))}
          </div>

          <div className="hybrid">
            <div className="stat-card__title" style={{ marginTop: 4 }}>
              <span>Hybrid split</span>
              <span className="hybrid__legend">3 office · 2 remote policy</span>
            </div>
            <div className="hybrid__bar">
              <span className="hybrid__office" style={{ width: `${stats.officeRatio}%` }}>
                {stats.officeRatio}% office
              </span>
              <span className="hybrid__remote">{100 - stats.officeRatio}% remote</span>
            </div>
            {stats.notScheduled > 0 && (
              <div className="hybrid__note">
                {stats.notScheduled} {stats.notScheduled === 1 ? 'hire hasn’t' : 'hires haven’t'} set
                their schedule yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New hires */}
      <div className="hire-table anim-slide-up delay-200" style={{ marginTop: 28 }}>
        <div className="hire-table__head">
          <span className="hire-table__head-title">
            New Hires{dept ? ` · ${dept}` : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {needAttention > 0 ? (
              <span className="pill pill--warn">{needAttention} need attention</span>
            ) : (
              <span className="pill pill--ok">All on track</span>
            )}
            <span className="pill pill--accent">{visibleHires.length} shown</span>
          </span>
        </div>

        {visibleHires.length === 0 && (
          <div className="empty-state">
            <p>No new hires {dept ? `in ${dept}` : 'onboarding right now'}.</p>
          </div>
        )}

        {visibleHires.map((hire) => (
          <HireRow
            key={hire.employeeId}
            hire={hire}
            employee={empById(hire.employeeId)}
            onOpen={(id) => {
              setCurrentId(id)
              navigate('/')
            }}
          />
        ))}
      </div>
    </div>
  )
}

function KpiCard({
  value,
  label,
  Icon,
  delay,
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
  hire,
  employee,
  onOpen,
}: {
  hire: HrOverviewItem
  employee?: Employee
  onOpen: (id: number) => void
}) {
  const upcoming = hire.daysToStart >= 0
  const attention = attentionFor(hire)
  const handle = employee?.email.split('@')[0]

  return (
    <div className="hire-table__row">
      <Avatar name={hire.fullName} src={hire.avatarUrl} size="md" />

      <div style={{ flex: 1, minWidth: 150 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          {hire.fullName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
          {hire.role} · {hire.department}
        </div>
        {attention && <div className="hire-row__attention">{attention}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
        <span className={upcoming ? 'pill pill--warn' : 'pill pill--accent'}>{hire.status}</span>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Next: {hire.currentPhaseLabel}</span>
      </div>

      <div style={{ width: 140 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>{hire.progress.percent}%</span>
          <span style={{ color: 'var(--text-subtle)' }}>{hire.progress.completed}/{hire.progress.total}</span>
        </div>
        <ProgressBar percent={hire.progress.percent} />
      </div>

      {/* Contact actions — reach the hire on the channels Meridian actually uses */}
      {employee && (
        <div className="hire-row__contact">
          <a
            className="contact-btn contact-btn--icon"
            href={`https://slack.com/app_redirect?channel=@${handle}`}
            target="_blank"
            rel="noreferrer"
            title={`Message ${hire.fullName.split(' ')[0]} on Slack`}
            aria-label="Message on Slack"
          >
            <MessageSquare size={14} />
          </a>
          <a
            className="contact-btn contact-btn--icon"
            href="https://meet.google.com/new"
            target="_blank"
            rel="noreferrer"
            title="Start a Google Meet"
            aria-label="Start a Google Meet"
          >
            <Video size={14} />
          </a>
          <a
            className="contact-btn contact-btn--icon"
            href={`mailto:${employee.email}`}
            title={employee.email}
            aria-label={`Email ${employee.email}`}
          >
            <Mail size={14} />
          </a>
        </div>
      )}

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

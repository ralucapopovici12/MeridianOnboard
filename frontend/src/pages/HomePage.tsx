import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutGrid,
  Megaphone,
  Users,
} from 'lucide-react'
import { api } from '../api/client'
import type { Progress } from '../api/types'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { EVENTS, NEWS, RESOURCES } from '../lib/companyContent'

/** "2026-07-01" -> "Wed, Jul 1". */
function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Whole days from today to an ISO date (negative = past). */
function daysFromToday(iso: string): number {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

function relativeLabel(iso: string): string {
  const n = daysFromToday(iso)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n < 0) return `${-n} days ago`
  return `In ${n} days`
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function HomePage() {
  const { currentId, current } = useCurrentEmployee()
  const [progress, setProgress] = useState<Progress | null>(null)

  // Only new hires have a meaningful onboarding checklist.
  useEffect(() => {
    if (currentId == null || !current?.isNewHire) {
      setProgress(null)
      return
    }
    let active = true
    api.getProgress(currentId).then((p) => active && setProgress(p)).catch(() => {})
    return () => {
      active = false
    }
  }, [currentId, current?.isNewHire])

  if (!current) return null

  return (
    <div>
      {/* Greeting */}
      <div className="page-header-row fade-up" style={{ marginBottom: 26 }}>
        <div>
          <h1 className="page-title">Welcome back, {current.firstName}.</h1>
          <p className="page-sub">
            {todayLabel()} · {current.role}, {current.department}
          </p>
        </div>
      </div>

      {/* Quick access */}
      <div className="home-section anim-slide-up">
        <div className="home-section__head">
          <span className="home-section__title">Jump back in</span>
        </div>
        <div className="home-quick">
          {current.isNewHire && (
            <Link to="/onboarding" className="home-card">
              <span className="home-card__icon"><ClipboardList size={18} /></span>
              <span className="home-card__title">My Onboarding</span>
              <span className="home-card__desc">Your first-month checklist</span>
              <span className="home-card__foot">
                {progress ? (
                  <span className="home-card__progress">
                    <span className="home-card__bar">
                      <span
                        className="home-card__bar-fill"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </span>
                    <span className="home-card__progress-pct">{progress.percent}%</span>
                  </span>
                ) : (
                  <span className="home-card__meta">Open checklist</span>
                )}
                <ArrowRight size={15} className="home-card__arrow" />
              </span>
            </Link>
          )}

          <Link to="/workspace" className="home-card">
            <span className="home-card__icon"><LayoutGrid size={18} /></span>
            <span className="home-card__title">Workspace</span>
            <span className="home-card__desc">Your board, tickets & time clock</span>
            <span className="home-card__foot">
              <span className="home-card__meta">Go to board</span>
              <ArrowRight size={15} className="home-card__arrow" />
            </span>
          </Link>

          <Link to="/people" className="home-card">
            <span className="home-card__icon"><Users size={18} /></span>
            <span className="home-card__title">People</span>
            <span className="home-card__desc">Find who does what</span>
            <span className="home-card__foot">
              <span className="home-card__meta">Browse directory</span>
              <ArrowRight size={15} className="home-card__arrow" />
            </span>
          </Link>

          {current.isHR && (
            <Link to="/hr" className="home-card">
              <span className="home-card__icon"><BarChart3 size={18} /></span>
              <span className="home-card__title">HR Dashboard</span>
              <span className="home-card__desc">Team onboarding overview</span>
              <span className="home-card__foot">
                <span className="home-card__meta">View dashboard</span>
                <ArrowRight size={15} className="home-card__arrow" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* News + events side by side */}
      <div className="home-columns">
        {/* Company news */}
        <div className="home-section anim-slide-up delay-100">
          <div className="home-section__head">
            <span className="home-section__title">
              <Megaphone size={14} className="home-section__icon" />
              Company news
            </span>
          </div>
          <div className="home-panel">
            {NEWS.map((n) => (
              <div key={n.id} className="news-item">
                <div className="news-item__row">
                  <span className="news-item__title">{n.title}</span>
                  <span className="news-item__tag">{n.tag}</span>
                </div>
                <p className="news-item__blurb">{n.blurb}</p>
                <span className="news-item__date">{relativeLabel(n.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="home-section anim-slide-up delay-200">
          <div className="home-section__head">
            <span className="home-section__title">
              <CalendarDays size={14} className="home-section__icon" />
              Upcoming events
            </span>
          </div>
          <div className="home-panel">
            {EVENTS.map((e) => (
              <div key={e.id} className="event-item">
                <span className="event-item__date">
                  <span className="event-item__day">{shortDate(e.date)}</span>
                  <span className="event-item__time">{e.time}</span>
                </span>
                <span className="event-item__body">
                  <span className="event-item__title">{e.title}</span>
                  <span className="event-item__kind">{e.kind}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies & resources */}
      <div className="home-section anim-slide-up delay-300">
        <div className="home-section__head">
          <span className="home-section__title">
            <FileText size={14} className="home-section__icon" />
            Policies & resources
          </span>
        </div>
        <div className="home-resources">
          {RESOURCES.map((r) => (
            <Link key={r.id} to={`/resources/${r.id}`} className="resource-item">
              <span className="resource-item__body">
                <span className="resource-item__title">{r.title}</span>
                <span className="resource-item__desc">{r.desc}</span>
              </span>
              <ArrowUpRight size={15} className="resource-item__arrow" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

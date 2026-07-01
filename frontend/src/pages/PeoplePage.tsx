import { useEffect, useMemo, useState } from 'react'
import { Building2, House, Mail, MessageSquare, Search, Sparkles, Video } from 'lucide-react'
import type { Employee } from '../api/types'
import { Avatar } from '../components/Avatar'
import { GuidedTour, useGuidedTour, type TourStep } from '../components/GuidedTour'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { scheduledLocation } from '../lib/format'
import { PRESENCE_LABEL, presenceFor } from '../lib/presence'

const PEOPLE_TOUR: TourStep[] = [
  {
    title: 'The people directory',
    body: 'Everyone at Meridian lives here — the fastest way to find who to ask about X.',
  },
  {
    target: 'people-search',
    title: 'Search anyone',
    body: 'Filter instantly by name, role, team, or what someone is working on.',
    hint: true,
  },
  {
    target: 'people-card',
    title: 'Everything on one card',
    body: 'Role, current project, whether they’re on-site or remote, live presence, and one-click Message, Meet or Email.',
  },
  {
    title: 'That’s the directory!',
    body: 'Reach out to a teammate whenever you’re stuck — that’s what they’re here for.',
  },
]

export function PeoplePage() {
  const { employees, loading, error, currentId } = useCurrentEmployee()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      [e.fullName, e.role, e.department, e.currentProject ?? '']
        .join(' ').toLowerCase().includes(q),
    )
  }, [employees, query])

  const byDepartment = useMemo(() => {
    const map = new Map<string, Employee[]>()
    for (const e of filtered) {
      const list = map.get(e.department) ?? []; list.push(e)
      map.set(e.department, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  // First-visit walkthrough.
  const tour = useGuidedTour(currentId != null ? `meridian.tour.people.${currentId}` : null)
  const { autoStartIfNew } = tour
  useEffect(() => {
    if (!loading && !error && employees.length > 0) autoStartIfNew()
  }, [loading, error, employees.length, autoStartIfNew])

  // Anchor the "person card" tour step to the very first card on the page.
  const firstPersonId = byDepartment[0]?.[1][0]?.id ?? null

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading directory…</p>
  if (error)   return <p style={{ color: 'var(--err)',       fontSize: 14 }}>{error}</p>

  return (
    <div>
      {/* Header + search */}
      <div className="page-header-row fade-up" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-sub">Who does what — so you know who to ask about X.</p>
          <button className="tour-launch" style={{ marginTop: 10 }} onClick={tour.start}>
            <Sparkles size={12} />
            Take a tour
          </button>
        </div>

        <div className="search-box" data-tour="people-search" style={{ width: 260 }}>
          <Search size={14} className="search-box__icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, team…"
            className="search-box__input"
            aria-label="Search people"
          />
        </div>
      </div>

      {byDepartment.length === 0 && (
        <div className="empty-state">No one matches &ldquo;{query}&rdquo;.</div>
      )}

      {byDepartment.map(([dept, people], i) => (
        <div
          key={dept}
          className="anim-slide-up"
          style={{ marginBottom: 36, animationDelay: `${i * 55}ms` }}
        >
          <div className="section-head">
            <span className="section-head__label">{dept}</span>
            <span className="section-head__count">
              {people.length} {people.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="people-grid">
            {people.map((p) => (
              <PersonCard
                key={p.id}
                person={p}
                isSelf={p.id === currentId}
                tourAnchor={p.id === firstPersonId}
              />
            ))}
          </div>
        </div>
      ))}

      {tour.open && <GuidedTour steps={PEOPLE_TOUR} onClose={tour.close} />}
    </div>
  )
}

function PersonCard({
  person,
  isSelf,
  tourAnchor,
}: {
  person: Employee
  isSelf: boolean
  tourAnchor?: boolean
}) {
  const handle = person.email.split('@')[0]
  // Slack-first contact (how teams actually reach each other), with a Meet call
  // and email as the formal/async fallback. Real Slack/Meet IDs would come from
  // the integration; the deep links demonstrate the intended flow.
  const slackHref = `https://slack.com/app_redirect?channel=@${handle}`
  const meetHref = 'https://meet.google.com/new'

  const presence = presenceFor(person.id, isSelf)
  const onSite = scheduledLocation(person.officeDays) === 'Office'
  const LocIcon = onSite ? Building2 : House

  return (
    <div className="person-card" data-tour={tourAnchor ? 'people-card' : undefined}>
      <div className="person-card__head">
        <span className="avatar-wrap">
          <Avatar name={person.fullName} src={person.avatarUrl} size="lg" />
          <span
            className={`presence-dot presence-dot--${presence}`}
            title={PRESENCE_LABEL[presence]}
          />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="person-card__name-row">
            <span className="person-card__name">{person.fullName}</span>
            {person.isHR && <span className="pill pill--accent person-card__tag">HR</span>}
            {person.isNewHire && (
              <span className="pill pill--ok person-card__tag">
                <Sparkles size={9} className="spin-slow" /> New
              </span>
            )}
          </div>
          <div className="person-card__role">{person.role}</div>
          {person.currentProject && (
            <div className="person-card__project">↳ {person.currentProject}</div>
          )}
          <div className="person-card__status">
            <span className={`presence-text presence-text--${presence}`}>
              {PRESENCE_LABEL[presence]}
            </span>
            <span className="person-card__status-sep">·</span>
            <span className={`loc-chip loc-chip--${onSite ? 'office' : 'remote'}`}>
              <LocIcon size={11} />
              {onSite ? 'On-site' : 'Remote'}
            </span>
          </div>
        </div>
      </div>

      <div className="person-card__contact">
        <a
          className="contact-btn contact-btn--primary"
          href={slackHref}
          target="_blank"
          rel="noreferrer"
          title={`Message ${person.firstName} on Slack`}
        >
          <MessageSquare size={14} />
          Message
        </a>
        <a
          className="contact-btn contact-btn--icon"
          href={meetHref}
          target="_blank"
          rel="noreferrer"
          title={`Start a Google Meet with ${person.firstName}`}
          aria-label={`Start a Google Meet with ${person.firstName}`}
        >
          <Video size={15} />
        </a>
        <a
          className="contact-btn contact-btn--icon"
          href={`mailto:${person.email}`}
          title={person.email}
          aria-label={`Email ${person.email}`}
        >
          <Mail size={15} />
        </a>
      </div>
    </div>
  )
}

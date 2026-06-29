import { useMemo, useState } from 'react'
import { Mail, Search, Sparkles } from 'lucide-react'
import type { Employee } from '../api/types'
import { Avatar } from '../components/Avatar'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'

export function PeoplePage() {
  const { employees, loading, error } = useCurrentEmployee()
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

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading directory…</p>
  if (error)   return <p style={{ color: 'var(--err)',       fontSize: 14 }}>{error}</p>

  return (
    <div>
      {/* Header + search */}
      <div className="page-header-row fade-up" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-sub">Who does what — so you know who to ask about X.</p>
        </div>

        <div className="search-box" style={{ width: 260 }}>
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
            {people.map((p) => <PersonCard key={p.id} person={p} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function PersonCard({ person }: { person: Employee }) {
  return (
    <div className="person-card">
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name={person.fullName} size="lg" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="person-card__name">{person.fullName}</span>
            {person.isHR && (
              <span className="pill pill--accent" style={{ fontSize: 10 }}>HR</span>
            )}
            {person.isNewHire && (
              <span className="pill pill--ok" style={{ fontSize: 10, gap: 3 }}>
                <Sparkles size={9} className="spin-slow" /> New
              </span>
            )}
          </div>
          <div className="person-card__role">{person.role}</div>
          {person.currentProject && (
            <div className="person-card__project">↳ {person.currentProject}</div>
          )}
          <a href={`mailto:${person.email}`} className="person-card__email">
            <Mail size={11} />
            {person.email}
          </a>
        </div>
      </div>
    </div>
  )
}

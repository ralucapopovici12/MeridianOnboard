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
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [employees, query])

  const byDepartment = useMemo(() => {
    const map = new Map<string, Employee[]>()
    for (const e of filtered) {
      const list = map.get(e.department) ?? []
      list.push(e)
      map.set(e.department, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  if (loading) return <p className="text-sm text-slate-500">Loading directory…</p>
  if (error) return <p className="text-sm text-rose-600">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">People at Meridian</h1>
        <p className="mt-1 text-sm text-slate-500">
          Who does what — so you know who to ask about X.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, role, team, or project…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {byDepartment.length === 0 && (
        <p className="text-sm text-slate-500">No one matches “{query}”.</p>
      )}

      {byDepartment.map(([department, people]) => (
        <section key={department}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {department}
            <span className="ml-2 font-normal lowercase text-slate-400">
              {people.length} {people.length === 1 ? 'person' : 'people'}
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PersonCard({ person }: { person: Employee }) {
  return (
    <div className="card rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar name={person.fullName} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-slate-800">
              {person.fullName}
            </span>
            {person.isHR && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                HR
              </span>
            )}
            {person.isNewHire && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <Sparkles className="h-3 w-3 anim-spin-slow" /> New hire
              </span>
            )}
          </div>
          <div className="truncate text-sm text-slate-500">{person.role}</div>
          {person.currentProject && (
            <div className="mt-1 truncate text-xs text-slate-400">
              Working on: {person.currentProject}
            </div>
          )}
          <a
            href={`mailto:${person.email}`}
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <Mail className="h-3 w-3" /> {person.email}
          </a>
        </div>
      </div>
    </div>
  )
}

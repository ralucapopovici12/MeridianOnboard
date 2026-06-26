import { Compass } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'

const navItems = [
  { to: '/', label: 'Onboarding', end: true },
  { to: '/people', label: 'People' },
  { to: '/hr', label: 'HR Dashboard' },
]

export function Header() {
  const { employees, current, setCurrentId } = useCurrentEmployee()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white anim-pulse-glow">
            <Compass className="h-5 w-5 anim-spin-slow" />
          </span>
          <div className="leading-tight">
            <div className="font-semibold text-slate-800">Meridian</div>
            <div className="text-xs text-slate-400">Onboarding</div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-400">I am</span>
          {current && <Avatar name={current.fullName} size="sm" />}
          <select
            aria-label="Select which employee you are"
            value={current?.id ?? ''}
            onChange={(e) => setCurrentId(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} — {e.role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}

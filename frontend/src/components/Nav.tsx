import { Compass } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'

const links = [
  { to: '/',       label: 'My Onboarding', end: true },
  { to: '/people', label: 'People' },
  { to: '/hr',     label: 'HR Dashboard' },
]

export function Nav() {
  const { employees, current, setCurrentId } = useCurrentEmployee()

  return (
    <header className="dark-header">
      {/* Logo */}
      <a href="/" className="dark-header__logo">
        <span className="dark-header__logo-mark">
          <Compass size={14} strokeWidth={2.5} />
        </span>
        <span className="dark-header__logo-name">Meridian</span>
      </a>

      <div className="dark-header__sep" />

      {/* Nav links */}
      <nav className="dark-header__links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `dark-header__link${isActive ? ' dark-header__link--active' : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User selector */}
      <div className="dark-header__right">
        <span className="dark-header__user-label">Viewing as</span>
        {current && (
          <div style={{ opacity: 0.85 }}>
            <Avatar name={current.fullName} size="sm" />
          </div>
        )}
        <select
          aria-label="Select which employee you are"
          value={current?.id ?? ''}
          onChange={(e) => setCurrentId(Number(e.target.value))}
          className="dark-header__select"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName} — {e.role}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}

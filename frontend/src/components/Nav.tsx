import { Compass, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'
import { ClockControl } from './ClockControl'

const links = [
  { to: '/',           label: 'Home', end: true },
  { to: '/onboarding', label: 'My Onboarding' },
  { to: '/workspace',  label: 'Workspace' },
  { to: '/people',     label: 'People' },
  { to: '/hr',         label: 'HR Dashboard' },
]

export function Nav() {
  const { current, logout } = useCurrentEmployee()

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

      {/* Clock + signed-in user */}
      <div className="dark-header__right">
        <ClockControl />
        <div className="dark-header__sep" style={{ margin: '13px 4px' }} />
        {current && (
          <div className="dark-header__user">
            <Avatar name={current.fullName} src={current.avatarUrl} size="sm" />
            <span className="dark-header__user-name">{current.fullName}</span>
          </div>
        )}
        <button
          type="button"
          className="dark-header__logout"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}

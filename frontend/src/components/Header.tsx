import { NavLink } from 'react-router-dom'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'
import { LogoMark } from './Logo'

const navItems = [
  { to: '/', label: 'Onboarding', end: true },
  { to: '/people', label: 'People' },
  { to: '/hr', label: 'HR Dashboard' },
]

export function Header() {
  const { employees, current, setCurrentId } = useCurrentEmployee()

  return (
    <header className="dark-header">
      <a href="/" className="dark-header__logo">
        <span className="dark-header__logo-mark">
          <LogoMark size={16} tone="inverse" title="" />
        </span>
        <span className="dark-header__logo-name">Meridian</span>
      </a>

      <div className="dark-header__sep" />

      <nav className="dark-header__links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `dark-header__link${isActive ? ' dark-header__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="dark-header__right">
        <span className="dark-header__user-label">Viewing as</span>
        {current && <Avatar name={current.fullName} src={current.avatarUrl} size="sm" />}
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

import { ClipboardList, Compass, LayoutDashboard, LayoutGrid, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'

const navItems = [
  { to: '/', label: 'My Onboarding', icon: ClipboardList, end: true },
  { to: '/workspace', label: 'Workspace', icon: LayoutGrid },
  { to: '/people', label: 'People', icon: Users },
  { to: '/hr', label: 'HR Dashboard', icon: LayoutDashboard },
]

export function Sidebar() {
  const { current } = useCurrentEmployee()

  return (
    <aside className="erp-sidebar">
      <div className="erp-sidebar__logo">
        <span className="erp-sidebar__logo-icon">
          <Compass size={19} />
        </span>
        <div>
          <div className="erp-sidebar__logo-name">Meridian</div>
          <div className="erp-sidebar__logo-sub">ERP Suite</div>
        </div>
      </div>

      <nav className="erp-sidebar__nav">
        <span className="erp-sidebar__nav-group">Main Menu</span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `erp-sidebar__nav-item${isActive ? ' erp-sidebar__nav-item--active' : ''}`
            }
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {current && (
        <div className="erp-sidebar__footer">
          <Avatar name={current.fullName} src={current.avatarUrl} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div className="erp-sidebar__footer-name">{current.firstName}</div>
            <div className="erp-sidebar__footer-role">{current.role}</div>
          </div>
        </div>
      )}
    </aside>
  )
}

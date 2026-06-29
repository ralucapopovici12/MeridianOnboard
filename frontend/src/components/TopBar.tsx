import { Bell, Search, Settings } from 'lucide-react'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { Avatar } from './Avatar'

export function TopBar() {
  const { employees, current, setCurrentId } = useCurrentEmployee()

  return (
    <header className="erp-topbar">
      <div className="erp-topbar__search">
        <Search size={14} className="erp-topbar__search-icon" />
        <input
          type="search"
          placeholder="Search people, tasks, projects…"
          className="erp-topbar__search-input"
          aria-label="Search"
        />
      </div>

      <div className="erp-topbar__actions">
        <button className="erp-topbar__action-btn" aria-label="Notifications">
          <Bell size={17} />
        </button>
        <button className="erp-topbar__action-btn" aria-label="Settings">
          <Settings size={17} />
        </button>

        <div className="erp-topbar__divider" />

        <div className="erp-topbar__user">
          <span className="erp-topbar__user-label">Viewing as</span>
          {current && <Avatar name={current.fullName} size="sm" />}
          <select
            aria-label="Select which employee you are"
            value={current?.id ?? ''}
            onChange={(e) => setCurrentId(Number(e.target.value))}
            className="erp-topbar__select"
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

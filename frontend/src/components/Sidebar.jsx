import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',          icon: '📋', label: 'Intake',     end: true },
  { to: '/dashboard', icon: '📊', label: 'Dashboard'  },
  { to: '/agent-logs',icon: '🤖', label: 'AI Logs'    },
  { to: '/doctors',   icon: '⚙️', label: 'Settings'   },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">🏥</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">MedFlow</div>
          <div className="sidebar-brand-sub">Clinical AI</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        <NavLink
          to="/doctors"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-item-icon">📈</span>
          System Health
        </NavLink>
      </div>
    </aside>
  )
}

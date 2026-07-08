import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-logo">🏥</div>
          <div>
            <div className="navbar-name">MedFlow</div>
            <div className="navbar-tagline">AI Healthcare Scheduling</div>
          </div>
        </NavLink>

        <ul className="navbar-nav">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              📋 Patient Intake
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/doctors"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              👨‍⚕️ Doctors
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/agent-logs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              🤖 Agent Logs
              <span className="nav-badge">AI</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

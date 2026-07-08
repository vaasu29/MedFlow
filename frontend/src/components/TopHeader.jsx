import { useState } from 'react'

export default function TopHeader() {
  const [search, setSearch] = useState('')

  return (
    <header className="top-header">
      {/* Search */}
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input
          id="header-search"
          className="header-search-input"
          placeholder="Search patient files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button id="header-notifications" className="header-icon-btn" title="Notifications">
          🔔
          <span className="notif-dot" />
        </button>
        <button id="header-help" className="header-icon-btn" title="Help">
          ❓
        </button>
        <div className="user-pill" id="header-user">
          <div className="user-avatar">SC</div>
          <span className="user-name">Dr. Sarah Chen</span>
        </div>
      </div>
    </header>
  )
}

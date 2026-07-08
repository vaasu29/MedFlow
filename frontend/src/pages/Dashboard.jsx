import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const URGENCY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [overrideModal, setOverrideModal] = useState(null)
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideLoading, setOverrideLoading] = useState(false)

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchDashboard() {
    try {
      const { data: d } = await axios.get(`${API}/api/dashboard`)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleOverride(appointmentId, newStatus) {
    setOverrideLoading(true)
    try {
      await axios.patch(`${API}/api/appointments/${appointmentId}`, { status: newStatus })
      await fetchDashboard()
      setOverrideModal(null)
    } catch (e) {
      console.error(e)
    } finally {
      setOverrideLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>Could not load dashboard. Is the backend running?</p>
        </div>
      </div>
    )
  }

  const { stats, urgencyBreakdown, recentAppointments, recentLogs } = data

  // Sort urgency
  const sortedUrgency = URGENCY_ORDER.map((u) => {
    const found = urgencyBreakdown.find((b) => b.urgency === u)
    return { urgency: u, count: found?._count ?? 0 }
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Real-time view of AI-scheduled appointments and agent activity</p>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📋</div>
          <div className="stat-value">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">🤖</div>
          <div className="stat-value">{stats.agentBookedCount}</div>
          <div className="stat-label">AI-Booked</div>
          <div className="stat-change">↑ {stats.agentBookingRate}% automation rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">👤</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Patients Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">👨‍⚕️</div>
          <div className="stat-value">{stats.totalDoctors}</div>
          <div className="stat-label">Active Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div className="stat-value">{stats.scheduledAppointments}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">❌</div>
          <div className="stat-value">{stats.cancelledAppointments}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* ── Urgency Breakdown ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="section-title mb-4">Urgency Breakdown</div>
          {sortedUrgency.map(({ urgency, count }) => (
            <div key={urgency} style={{ marginBottom: '1rem' }}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-600 urgency-${urgency.toLowerCase()}`}>{urgency}</span>
                <span className="text-sm text-muted">{count}</span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: stats.totalAppointments > 0 ? `${(count / stats.totalAppointments) * 100}%` : '0%',
                    background: urgency === 'CRITICAL' ? 'var(--gradient-red)'
                      : urgency === 'HIGH' ? 'var(--gradient-amber)'
                      : urgency === 'MEDIUM' ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                      : 'var(--gradient-green)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Agent Logs ───────────────── */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Recent AI Decisions</div>
            <span className="badge badge-agent">🤖 LIVE</span>
          </div>
          {recentLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <div className="empty-icon" style={{ fontSize: '1.5rem' }}>🤖</div>
              <p className="text-sm">No agent decisions yet. Submit an intake!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {recentLogs.map((log) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                }}>
                  <span>{log.actionTaken === 'BOOKED' ? '✅' : '⚠️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 500 }}>
                      {log.patient?.name || 'Anonymous'}
                    </div>
                    <div className="text-xs text-muted truncate">{log.rawInput.slice(0, 60)}…</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge ${log.urgencyLevel === 'CRITICAL' ? 'badge-critical' : log.urgencyLevel === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                      {log.urgencyLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Appointments Table ──────────────────── */}
      <div className="section-header">
        <div className="section-title">Recent Appointments</div>
        <span className="text-sm text-muted">Human override available on all AI decisions</span>
      </div>

      <div className="table-container">
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No appointments yet. Submit a patient intake to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Booked By</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{appt.patient?.name}</div>
                    <div className="text-xs text-muted">{appt.patient?.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>Dr. {appt.doctor?.name}</div>
                    <div className="text-xs text-muted">{appt.doctor?.specialty}</div>
                  </td>
                  <td>
                    <div>{appt.slot?.date}</div>
                    <div className="text-xs text-muted">{appt.slot?.startTime} – {appt.slot?.endTime}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${appt.urgency?.toLowerCase()}`}>{appt.urgency}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${appt.status?.toLowerCase()}`}>{appt.status}</span>
                  </td>
                  <td>
                    {appt.agentBooked
                      ? <span className="badge badge-agent">🤖 AI</span>
                      : <span className="badge badge-scheduled">👤 Human</span>}
                  </td>
                  <td>
                    {appt.status === 'SCHEDULED' && (
                      <button
                        id={`override-${appt.id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setOverrideModal(appt); setOverrideStatus('CANCELLED') }}
                      >
                        Override
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Override Modal ─────────────────────────────── */}
      {overrideModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200,
        }}
          onClick={() => setOverrideModal(null)}
        >
          <div
            className="card card-glow"
            style={{ maxWidth: 440, width: '100%', margin: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="agent-header mb-4">
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <div>
                <div className="section-title">Human Override</div>
                <div className="text-sm text-muted">Override AI decision for {overrideModal.patient?.name}</div>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">New Status</label>
              <select
                id="override-status-select"
                className="form-select"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
              >
                <option value="CANCELLED">Cancel Appointment</option>
                <option value="COMPLETED">Mark as Completed</option>
                <option value="RESCHEDULED">Mark as Rescheduled</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                id="override-confirm"
                className="btn btn-danger"
                style={{ flex: 1 }}
                disabled={overrideLoading}
                onClick={() => handleOverride(overrideModal.id, overrideStatus)}
              >
                {overrideLoading ? <div className="spinner spinner-sm" /> : 'Apply Override'}
              </button>
              <button
                id="override-cancel"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setOverrideModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

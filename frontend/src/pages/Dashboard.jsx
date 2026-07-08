import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const URGENCY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const URGENCY_COLORS = {
  CRITICAL: 'var(--accent-red)',
  HIGH:     'var(--accent-orange)',
  MEDIUM:   'var(--accent-amber)',
  LOW:      'var(--accent-green)',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [overrideStatus, setOverrideStatus] = useState('CANCELLED')
  const [overrideLoading, setOverrideLoading] = useState(false)

  useEffect(() => {
    fetchDashboard()
    const iv = setInterval(fetchDashboard, 30000)
    return () => clearInterval(iv)
  }, [])

  async function fetchDashboard() {
    try {
      const { data: d } = await axios.get(`${API}/api/dashboard`)
      setData(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function applyOverride() {
    setOverrideLoading(true)
    try {
      await axios.patch(`${API}/api/appointments/${modal.id}`, { status: overrideStatus })
      await fetchDashboard()
      setModal(null)
    } catch (e) { console.error(e) }
    finally { setOverrideLoading(false) }
  }

  if (loading) return (
    <div className="loading-state"><div className="spinner" /><span>Loading dashboard…</span></div>
  )

  if (!data) return (
    <div className="empty"><div className="empty-icon">⚠️</div><p>Backend unreachable.</p></div>
  )

  const { stats, urgencyBreakdown, recentAppointments, recentLogs } = data
  const urgencyRows = URGENCY_ORDER.map(u => {
    const found = urgencyBreakdown.find(b => b.urgency === u)
    return { urgency: u, count: found?._count ?? 0 }
  })

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time clinical operations and AI scheduling activity</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon si-blue">📋</div>
          <div className="stat-value">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-teal">🤖</div>
          <div className="stat-value">{stats.agentBookedCount}</div>
          <div className="stat-label">AI-Scheduled</div>
          <div className="stat-delta">↑ {stats.agentBookingRate}% automation rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-purple">👤</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-amber">👨‍⚕️</div>
          <div className="stat-value">{stats.totalDoctors}</div>
          <div className="stat-label">Active Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green">✅</div>
          <div className="stat-value">{stats.scheduledAppointments}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-red">❌</div>
          <div className="stat-value">{stats.cancelledAppointments}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Urgency breakdown */}
        <div className="card">
          <div className="card-title">Urgency Distribution</div>
          {urgencyRows.map(({ urgency, count }) => (
            <div key={urgency} style={{ marginBottom: '0.875rem' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-600" style={{ color: URGENCY_COLORS[urgency] }}>{urgency}</span>
                <span className="text-sm text-muted">{count}</span>
              </div>
              <div className="conf-bar">
                <div className="conf-fill" style={{
                  width: stats.totalAppointments > 0 ? `${(count / stats.totalAppointments) * 100}%` : '0%',
                  background: URGENCY_COLORS[urgency],
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent AI decisions */}
        <div className="card">
          <div className="section-hdr">
            <div className="section-hdr-title">Recent AI Decisions</div>
            <span className="badge b-ai">🤖 LIVE</span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="empty" style={{ padding: '1.5rem' }}>
              <div className="empty-icon" style={{ fontSize: '1.4rem' }}>🤖</div>
              <p>No AI decisions yet. Submit a patient intake!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentLogs.map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                }}>
                  <span>{log.actionTaken === 'BOOKED' ? '✅' : '⚠️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-600">{log.patient?.name || 'Anonymous'}</div>
                    <div className="text-xs text-muted truncate">{log.rawInput.slice(0, 55)}…</div>
                  </div>
                  <span className={`badge b-${log.urgencyLevel?.toLowerCase()}`}>{log.urgencyLevel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointments table */}
      <div className="section-hdr">
        <div className="section-hdr-title">Recent Appointments</div>
        <span className="text-xs text-muted">Human override available on all AI decisions</span>
      </div>

      <div className="table-wrap">
        {recentAppointments.length === 0 ? (
          <div className="empty"><div className="empty-icon">📅</div><p>No appointments yet.</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date / Time</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Booked By</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map(appt => (
                <tr key={appt.id}>
                  <td>
                    <div className="font-600">{appt.patient?.name}</div>
                    <div className="text-xs text-muted">{appt.patient?.email}</div>
                  </td>
                  <td>
                    <div className="font-600">Dr. {appt.doctor?.name}</div>
                    <div className="text-xs text-muted">{appt.doctor?.specialty}</div>
                  </td>
                  <td>
                    <div>{appt.slot?.date}</div>
                    <div className="text-xs text-muted">{appt.slot?.startTime} – {appt.slot?.endTime}</div>
                  </td>
                  <td><span className={`badge b-${appt.urgency?.toLowerCase()}`}>{appt.urgency}</span></td>
                  <td><span className={`badge b-${appt.status?.toLowerCase()}`}>{appt.status}</span></td>
                  <td>
                    {appt.agentBooked
                      ? <span className="badge b-ai">🤖 AI</span>
                      : <span className="badge b-scheduled">👤 Human</span>}
                  </td>
                  <td>
                    {appt.status === 'SCHEDULED' && (
                      <button
                        id={`override-${appt.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setModal(appt); setOverrideStatus('CANCELLED') }}
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

      {/* Override modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">👤 Human Override</div>
            <div className="modal-sub">Override AI decision for {modal.patient?.name}</div>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                id="override-status"
                className="form-input"
                value={overrideStatus}
                onChange={e => setOverrideStatus(e.target.value)}
              >
                <option value="CANCELLED">Cancel Appointment</option>
                <option value="COMPLETED">Mark as Completed</option>
                <option value="RESCHEDULED">Mark as Rescheduled</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button id="override-confirm" className="btn btn-danger w-full" disabled={overrideLoading} onClick={applyOverride}>
                {overrideLoading ? <div className="spinner spinner-sm" /> : 'Apply Override'}
              </button>
              <button id="override-cancel" className="btn btn-ghost w-full" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

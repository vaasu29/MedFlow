import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

export default function AgentLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const { data } = await axios.get(`${API}/api/agent-logs?limit=100`)
      setLogs(data.logs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.urgencyLevel === filter || l.actionTaken === filter)

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: '1.75rem' }}>🤖</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Agent Decision Log</h1>
          <span className="badge badge-agent">Explainability</span>
        </div>
        <p className="page-subtitle">
          Every AI decision — logged with full reasoning, confidence scores, and timing.
          This is your audit trail for all autonomous actions.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {['ALL', 'BOOKED', 'FLAGGED_FOR_REVIEW', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? '📋 All' : f === 'BOOKED' ? '✅ Booked' : f === 'FLAGGED_FOR_REVIEW' ? '⚠️ Flagged' : f}
          </button>
        ))}
        <span className="text-sm text-muted" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          {filtered.length} records
        </span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading agent logs…</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <p>No agent logs yet. Submit a patient intake to see AI decisions here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((log, i) => {
            const isExpanded = expanded === log.id
            let parsed = {}
            try { parsed = JSON.parse(log.parsedSymptoms) } catch {}

            return (
              <div
                key={log.id}
                className={`log-entry ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="log-entry-header">
                  <div className="log-entry-meta">
                    <span style={{ fontSize: '1.1rem' }}>
                      {log.actionTaken === 'BOOKED' ? '✅' : '⚠️'}
                    </span>
                    <span style={{ fontWeight: 600 }}>{log.patient?.name || 'Anonymous Patient'}</span>
                    <span className={`badge badge-${log.urgencyLevel?.toLowerCase()}`}>
                      {log.urgencyLevel}
                    </span>
                    <span className={`badge ${log.actionTaken === 'BOOKED' ? 'badge-scheduled' : 'badge-medium'}`}>
                      {log.actionTaken === 'BOOKED' ? 'Booked' : 'Flagged'}
                    </span>
                    <span className="badge badge-agent">{log.recommendedSpecialty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-mono">{log.processingTimeMs}ms</span>
                    <span className="text-xs text-muted">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Collapsed preview */}
                {!isExpanded && (
                  <div className="text-xs text-muted truncate mt-2" style={{ marginLeft: '1.875rem' }}>
                    "{log.rawInput.slice(0, 90)}{log.rawInput.length > 90 ? '…' : ''}"
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="log-entry-details">
                    <div className="log-raw">"{log.rawInput}"</div>

                    <div className="log-grid">
                      <div className="log-field">
                        <span className="log-field-label">Patient Email</span>
                        <span className="log-field-value">{log.patient?.email || '—'}</span>
                      </div>
                      <div className="log-field">
                        <span className="log-field-label">Urgency Level</span>
                        <span className={`log-field-value urgency-${log.urgencyLevel?.toLowerCase()}`}>{log.urgencyLevel}</span>
                      </div>
                      <div className="log-field">
                        <span className="log-field-label">Recommended Specialty</span>
                        <span className="log-field-value">{log.recommendedSpecialty}</span>
                      </div>
                      <div className="log-field">
                        <span className="log-field-label">Confidence Score</span>
                        <span className="log-field-value" style={{ color: 'var(--accent-primary)' }}>
                          {Math.round(log.confidence * 100)}%
                        </span>
                      </div>
                      <div className="log-field">
                        <span className="log-field-label">Action Taken</span>
                        <span className={`log-field-value ${log.actionTaken === 'BOOKED' ? 'action-booked' : 'action-flagged'}`}>
                          {log.actionTaken}
                        </span>
                      </div>
                      <div className="log-field">
                        <span className="log-field-label">Processing Time</span>
                        <span className="log-field-value font-mono">{log.processingTimeMs}ms</span>
                      </div>
                      <div className="log-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="log-field-label">Urgency Reasoning</span>
                        <span className="log-field-value text-sm" style={{ color: 'var(--text-secondary)' }}>{log.urgencyReason}</span>
                      </div>
                      {log.actionDetails && (
                        <div className="log-field" style={{ gridColumn: '1 / -1' }}>
                          <span className="log-field-label">Action Details</span>
                          <span className="log-field-value text-sm" style={{ color: 'var(--text-secondary)' }}>{log.actionDetails}</span>
                        </div>
                      )}
                      {parsed.keywords?.length > 0 && (
                        <div className="log-field" style={{ gridColumn: '1 / -1' }}>
                          <span className="log-field-label">Matched Keywords</span>
                          <div className="slot-list mt-1">
                            {parsed.keywords.map((kw) => (
                              <span key={kw} className="slot-chip">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confidence bar */}
                    <div style={{ marginTop: '1rem' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted">Confidence</span>
                        <span className="text-xs" style={{ color: 'var(--accent-primary)' }}>{Math.round(log.confidence * 100)}%</span>
                      </div>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{ width: `${Math.round(log.confidence * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

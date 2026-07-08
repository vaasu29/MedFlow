import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

export default function AgentLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    try {
      const { data } = await axios.get(`${API}/api/agent-logs?limit=100`)
      setLogs(data.logs)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const FILTERS = ['ALL', 'BOOKED', 'FLAGGED_FOR_REVIEW', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  const filtered = filter === 'ALL' ? logs
    : logs.filter(l => l.urgencyLevel === filter || l.actionTaken === filter)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="page-title" style={{ marginBottom: 0 }}>AI Logs</h1>
          <span className="badge b-ai">Explainability</span>
        </div>
        <p className="page-subtitle">
          Every autonomous AI decision — logged with full reasoning, confidence scores, and timing.
        </p>
      </div>

      {/* Filters */}
      <div className="filter-strip">
        {FILTERS.map(f => (
          <button
            key={f}
            id={`log-filter-${f.toLowerCase()}`}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? '📋 All'
              : f === 'BOOKED' ? '✅ Booked'
              : f === 'FLAGGED_FOR_REVIEW' ? '⚠️ Flagged'
              : f}
          </button>
        ))}
        <span className="text-xs text-muted" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          {filtered.length} records
        </span>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /><span>Loading agent logs…</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🤖</div>
          <p>No agent logs yet. Submit a patient intake to see AI decisions here.</p>
        </div>
      ) : (
        filtered.map((log, i) => {
          const isExp = expanded === log.id
          let parsed = {}
          try { parsed = JSON.parse(log.parsedSymptoms) } catch {}

          return (
            <div
              key={log.id}
              className={`log-item ${isExp ? 'expanded' : ''}`}
              onClick={() => setExpanded(isExp ? null : log.id)}
            >
              <div className="log-item-header">
                <span>{log.actionTaken === 'BOOKED' ? '✅' : '⚠️'}</span>
                <span className="text-sm font-600">{log.patient?.name || 'Anonymous'}</span>
                <span className={`badge b-${log.urgencyLevel?.toLowerCase()}`}>{log.urgencyLevel}</span>
                <span className={`badge ${log.actionTaken === 'BOOKED' ? 'b-scheduled' : 'b-medium'}`}>
                  {log.actionTaken === 'BOOKED' ? 'Booked' : 'Flagged'}
                </span>
                <span className="badge b-ai">{log.recommendedSpecialty}</span>
                <div className="log-item-expand">
                  <span className="text-xs text-muted font-mono">{log.processingTimeMs}ms</span>
                  {'  '}
                  <span className="text-xs text-muted">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {'  '}
                  <span style={{ color: 'var(--text-muted)' }}>{isExp ? '▲' : '▼'}</span>
                </div>
              </div>

              {!isExp && (
                <div className="text-xs text-muted truncate mt-2" style={{ paddingLeft: '1.75rem' }}>
                  "{log.rawInput.slice(0, 90)}{log.rawInput.length > 90 ? '…' : ''}"
                </div>
              )}

              {isExp && (
                <div className="log-detail">
                  <div className="log-raw-quote">"{log.rawInput}"</div>
                  <div className="log-fields">
                    <div>
                      <div className="lf-label">Patient Email</div>
                      <div className="lf-value">{log.patient?.email || '—'}</div>
                    </div>
                    <div>
                      <div className="lf-label">Urgency</div>
                      <div className={`lf-value urg-${log.urgencyLevel?.toLowerCase()}`}>{log.urgencyLevel}</div>
                    </div>
                    <div>
                      <div className="lf-label">Specialty</div>
                      <div className="lf-value">{log.recommendedSpecialty}</div>
                    </div>
                    <div>
                      <div className="lf-label">Confidence</div>
                      <div className="lf-value text-teal">{Math.round(log.confidence * 100)}%</div>
                    </div>
                    <div>
                      <div className="lf-label">Action</div>
                      <div className={`lf-value ${log.actionTaken === 'BOOKED' ? 'text-teal' : 'urg-high'}`}>
                        {log.actionTaken}
                      </div>
                    </div>
                    <div>
                      <div className="lf-label">Processing Time</div>
                      <div className="lf-value font-mono">{log.processingTimeMs}ms</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="lf-label">Reasoning</div>
                      <div className="lf-value text-sm text-muted">{log.urgencyReason}</div>
                    </div>
                    {log.actionDetails && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="lf-label">Action Details</div>
                        <div className="lf-value text-sm text-muted">{log.actionDetails}</div>
                      </div>
                    )}
                    {parsed.keywords?.length > 0 && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="lf-label">Matched Keywords</div>
                        <div className="slot-chips mt-1">
                          {parsed.keywords.map(kw => (
                            <span key={kw} className="slot-chip">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.875rem' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted">Confidence Score</span>
                      <span className="text-xs text-teal">{Math.round(log.confidence * 100)}%</span>
                    </div>
                    <div className="conf-bar">
                      <div className="conf-fill teal" style={{ width: `${Math.round(log.confidence * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

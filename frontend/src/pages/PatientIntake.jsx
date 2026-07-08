import { useState } from 'react'
import axios from 'axios'
import medicalScan from '../assets/medical_scan.png'

const API = import.meta.env.VITE_API_URL || ''

const PROCESS_STEPS = [
  {
    icon: '📝',
    title: 'Step 1: Symptoms',
    desc: 'Describe your condition in detail.',
  },
  {
    icon: '🔬',
    title: 'Step 2: AI Analysis',
    desc: 'MedFlow maps symptoms to clinical patterns.',
  },
  {
    icon: '📅',
    title: 'Step 3: Scheduling',
    desc: 'Instant booking based on severity.',
  },
]

const THINKING_STEPS = [
  { icon: '🔍', label: 'Parsing symptoms',         key: 'parse'    },
  { icon: '⚡', label: 'Classifying urgency',       key: 'urgency'  },
  { icon: '🩺', label: 'Identifying specialist',    key: 'spec'     },
  { icon: '📅', label: 'Checking availability',     key: 'avail'    },
  { icon: '✅', label: 'Confirming appointment',    key: 'book'     },
]

export default function PatientIntake() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', symptoms: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.symptoms.trim() || form.symptoms.trim().length < 10) errs.symptoms = 'Minimum 10 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsSubmitting(true)
    setIsThinking(true)
    setResult(null)
    setApiError('')

    try {
      await new Promise(r => setTimeout(r, 2400))
      const { data } = await axios.post(`${API}/api/intake`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        symptoms: form.symptoms,
      })
      setResult(data)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Could not reach backend. Is the server running?')
    } finally {
      setIsSubmitting(false)
      setIsThinking(false)
    }
  }

  function reset() {
    setForm({ name: '', phone: '', email: '', symptoms: '' })
    setResult(null)
    setErrors({})
    setApiError('')
  }

  const urgencyClass = result ? `urg-${result.agent?.urgency?.toLowerCase()}` : ''

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Patient Intake</h1>
        <p className="page-subtitle">
          Please provide as much detail as possible. Our AI Assistant will analyze your
          symptoms to streamline your clinical visit.
        </p>
      </div>

      <div className="intake-layout">
        {/* ── Left: Form ─────────────────────────────── */}
        <div>
          {!result ? (
            <div className="intake-form-card">
              <form onSubmit={handleSubmit} id="intake-form">
                {/* Row 1: Name + Phone */}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="intake-name">Full Patient Name</label>
                    <input
                      id="intake-name"
                      className="form-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Jonathan Harker"
                      autoComplete="name"
                    />
                    {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>{errors.name}</span>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="intake-phone">Contact Number</label>
                    <input
                      id="intake-phone"
                      className="form-input"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label" htmlFor="intake-email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                      id="intake-email"
                      className="form-input has-icon"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="patient@email.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email
                    ? <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>{errors.email}</span>
                    : form.email && /\S+@\S+\.\S+/.test(form.email) && (
                      <div className="input-verified">
                        <span>✅</span> Verified contact method for AI results
                      </div>
                    )
                  }
                </div>

                {/* Symptoms */}
                <div className="form-group">
                  <div className="symptoms-header">
                    <label className="form-label" htmlFor="intake-symptoms" style={{ marginBottom: 0 }}>
                      Free-text symptoms
                    </label>
                    <div className="ai-ready-badge">
                      <span className="ai-ready-dot" />
                      AI analysis ready
                    </div>
                  </div>
                  <textarea
                    id="intake-symptoms"
                    className="form-textarea"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    placeholder="Describe how you're feeling in your own words... (e.g. 'I've had a persistent dull ache in my lower back for three days, worsening when I sit for long periods.')"
                    rows={6}
                  />
                  {errors.symptoms && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>{errors.symptoms}</span>
                  )}
                </div>

                {apiError && <div className="error-box">⚠️ {apiError}</div>}

                {/* Submit */}
                <button
                  id="intake-submit"
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <><div className="spinner spinner-sm" /> Processing…</>
                    : <><span className="submit-icon">🚀</span> Submit to AI Assistant</>
                  }
                </button>

                <p className="submit-disclaimer">
                  By submitting, you agree to our privacy terms and AI processing policy.
                </p>
              </form>

              {/* Thinking panel */}
              {isThinking && (
                <div className="thinking-panel">
                  <div className="thinking-header">
                    <div className="thinking-icon">🤖</div>
                    <div>
                      <div className="thinking-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        AI Agent Processing
                        <div className="thinking-dots">
                          <span /><span /><span />
                        </div>
                      </div>
                      <div className="text-xs text-muted">Analyzing your clinical data</div>
                    </div>
                  </div>
                  <div className="thinking-steps">
                    {THINKING_STEPS.map(s => (
                      <div className="thinking-step" key={s.key}>
                        <span className="ts-icon">{s.icon}</span>
                        <div>
                          <div className="ts-label">{s.label}</div>
                          <div className="ts-value">
                            <div className="thinking-dots"><span /><span /><span /></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Result view ─────────────────────────── */
            <div>
              {result.agent?.action === 'BOOKED' ? (
                <div className="agent-result success">
                  <div className="agent-result-header">
                    <span className="agent-result-icon">✅</span>
                    <div>
                      <div className="agent-result-title">Appointment Confirmed</div>
                      <div className="agent-result-sub">AI agent successfully scheduled your visit</div>
                    </div>
                    <span className={`badge b-${result.agent.urgency?.toLowerCase()}`} style={{ marginLeft: 'auto' }}>
                      {result.agent.urgency}
                    </span>
                  </div>

                  <div className="result-grid">
                    <div>
                      <div className="result-field-label">Patient</div>
                      <div className="result-field-value">{result.patient?.name}</div>
                    </div>
                    <div>
                      <div className="result-field-label">Doctor</div>
                      <div className="result-field-value">Dr. {result.agent.doctor?.name}</div>
                    </div>
                    <div>
                      <div className="result-field-label">Specialty</div>
                      <div className="result-field-value text-blue">{result.agent.recommendedSpecialty}</div>
                    </div>
                    <div>
                      <div className="result-field-label">Date</div>
                      <div className="result-field-value">{result.agent.slot?.date}</div>
                    </div>
                    <div>
                      <div className="result-field-label">Time</div>
                      <div className="result-field-value">{result.agent.slot?.startTime} – {result.agent.slot?.endTime}</div>
                    </div>
                    <div>
                      <div className="result-field-label">Confidence</div>
                      <div className="result-field-value text-teal">{Math.round(result.agent.confidence * 100)}%</div>
                    </div>
                  </div>

                  {/* Agent reasoning */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-md)', padding: '1rem', marginTop: '0.5rem' }}>
                    <div className="text-xs text-muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                      AI Reasoning
                    </div>
                    <div className="thinking-steps">
                      <div className="thinking-step" style={{ animation: 'none', opacity: 1 }}>
                        <span className="ts-icon">⚡</span>
                        <div>
                          <div className="ts-label">Urgency Classification</div>
                          <div className={`ts-value ${urgencyClass}`}>{result.agent.urgency}</div>
                          <div className="text-xs text-muted mt-1">{result.agent.urgencyReason}</div>
                        </div>
                      </div>
                      <div className="thinking-step" style={{ animation: 'none', opacity: 1 }}>
                        <span className="ts-icon">🩺</span>
                        <div style={{ flex: 1 }}>
                          <div className="ts-label">Specialist Match</div>
                          <div className="ts-value">{result.agent.recommendedSpecialty}</div>
                          <div style={{ marginTop: '0.4rem' }}>
                            <div className="conf-bar">
                              <div className="conf-fill teal" style={{ width: `${Math.round(result.agent.confidence * 100)}%` }} />
                            </div>
                            <div className="text-xs text-muted mt-1">{Math.round(result.agent.confidence * 100)}% confidence</div>
                          </div>
                        </div>
                      </div>
                      <div className="thinking-step" style={{ animation: 'none', opacity: 1 }}>
                        <span className="ts-icon">📝</span>
                        <div>
                          <div className="ts-label">Parsed Symptoms</div>
                          <div className="ts-value text-sm">{result.agent.parsedSymptoms?.summary}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="agent-result flagged">
                  <div className="agent-result-header">
                    <span className="agent-result-icon">⚠️</span>
                    <div>
                      <div className="agent-result-title">Flagged for Human Review</div>
                      <div className="agent-result-sub">{result.agent.message}</div>
                    </div>
                  </div>
                </div>
              )}

              <button id="intake-reset" className="btn btn-ghost w-full mt-4" onClick={reset}>
                ← Submit Another Intake
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Side Panels ──────────────────────── */}
        <div className="right-panel">
          {/* Process Overview */}
          <div className="process-card">
            <div className="card-title">Process Overview</div>
            {PROCESS_STEPS.map((step, i) => (
              <div className="process-step" key={i}>
                <div className="process-step-icon">{step.icon}</div>
                <div>
                  <div className="process-step-title">{step.title}</div>
                  <div className="process-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Precision Engine */}
          <div className="ai-engine-card">
            <div className="ai-engine-badge">
              <div className="ai-engine-badge-icon">🛡️</div>
              AI PRECISION ENGINE
            </div>
            <p className="ai-engine-desc">
              MedFlow's model has been trained on over 2M clinical cases to ensure accurate triage.
            </p>
            <div className="accuracy-row">
              <span className="accuracy-label">Pattern Matching</span>
              <span className="accuracy-value">98.2%</span>
            </div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{ width: '98.2%' }} />
            </div>
          </div>

          {/* HIPAA Scan Card */}
          <div className="scan-card">
            <img src={medicalScan} alt="Medical body scan visualization" className="scan-card-img" />
            <div className="scan-card-overlay">
              <p className="scan-card-text">
                Your data is encrypted and handled by HIPAA-compliant clinical protocols.{' '}
                <span className="scan-card-brand">MedFlow</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

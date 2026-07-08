import { useState } from 'react'
import axios from 'axios'
import AgentThinking from '../components/AgentThinking'

const API = import.meta.env.VITE_API_URL || ''

const SAMPLE_SYMPTOMS = [
  'I have been experiencing chest pain and shortness of breath for the past 2 days',
  'Severe migraine headaches for 3 days, with nausea and blurred vision',
  'Persistent cough and wheezing for a week, difficulty breathing at night',
  'Sharp abdominal pain in lower right area, nausea, no fever',
  'Knee pain and swelling after a fall, difficulty walking',
]

export default function PatientIntake() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', symptoms: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.symptoms.trim() || form.symptoms.trim().length < 10) errs.symptoms = 'Please describe symptoms (min 10 characters)'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsSubmitting(true)
    setIsThinking(true)
    setResult(null)
    setSubmitError('')

    try {
      // Simulate agent "thinking" time for realism
      await new Promise((r) => setTimeout(r, 2200))
      const { data } = await axios.post(`${API}/api/intake`, form)
      setResult(data)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit intake. Is the backend running?')
    } finally {
      setIsSubmitting(false)
      setIsThinking(false)
    }
  }

  function reset() {
    setForm({ name: '', email: '', phone: '', dateOfBirth: '', symptoms: '' })
    setResult(null)
    setErrors({})
    setSubmitError('')
  }

  return (
    <div className="page">
      <div className="intake-layout">
        {/* ── Hero Column ─────────────────────────────── */}
        <div className="intake-hero">
          <div className="intake-hero-badge">
            🤖 Powered by AI Agent
          </div>
          <h1 className="intake-hero-title">
            Smart Patient Intake
            <br />
            <span className="highlight">Automated by AI</span>
          </h1>
          <p className="intake-hero-desc">
            Describe your symptoms in plain language. Our AI agent will classify
            urgency, identify the right specialist, and automatically book the
            earliest available appointment — in seconds.
          </p>

          <div className="feature-list">
            {[
              ['⚡', 'Instant urgency classification (LOW → CRITICAL)'],
              ['🩺', 'AI-matched specialist recommendation'],
              ['📅', 'Autonomous appointment booking'],
              ['🔍', 'Full decision explainability & audit log'],
              ['👤', 'Human override for every AI decision'],
            ].map(([icon, text]) => (
              <div className="feature-item" key={text}>
                <span className="feature-icon">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Sample symptoms */}
          <div className="card mt-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-xs text-muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              Try a sample description
            </div>
            <div className="flex flex-col gap-2">
              {SAMPLE_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.78rem' }}
                  onClick={() => setForm((f) => ({ ...f, symptoms: s }))}
                >
                  {s.slice(0, 55)}…
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form Column ─────────────────────────────── */}
        <div>
          {!result ? (
            <div className="intake-form-card">
              <div className="form-title">Patient Information</div>
              <p className="text-sm text-muted mt-1">All fields marked * are required</p>
              <div className="form-divider" />

              <form onSubmit={handleSubmit} id="intake-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="intake-name">
                      Full Name <span>*</span>
                    </label>
                    <input
                      id="intake-name"
                      className="form-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="intake-email">
                      Email <span>*</span>
                    </label>
                    <input
                      id="intake-email"
                      className="form-input"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      autoComplete="email"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="intake-phone">Phone</label>
                    <input
                      id="intake-phone"
                      className="form-input"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="intake-dob">Date of Birth</label>
                    <input
                      id="intake-dob"
                      className="form-input"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label className="form-label" htmlFor="intake-symptoms">
                      Describe Your Symptoms <span>*</span>
                    </label>
                    <textarea
                      id="intake-symptoms"
                      className="form-textarea"
                      name="symptoms"
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="Describe what you're experiencing in your own words. The AI agent will analyze this to book the right appointment..."
                      rows={5}
                    />
                    {errors.symptoms && <span className="form-error">{errors.symptoms}</span>}
                    <span className="form-hint">{form.symptoms.length} characters</span>
                  </div>
                </div>

                {submitError && (
                  <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--accent-red)' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <button
                  id="intake-submit"
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: '1.5rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><div className="spinner spinner-sm" /> AI Agent Processing…</>
                  ) : (
                    <> Submit to AI Agent →</>
                  )}
                </button>
              </form>

              {/* Agent thinking panel */}
              {isThinking && <AgentThinking isThinking={true} />}
            </div>
          ) : (
            /* ── Result Card ─────────────────────────── */
            <div>
              {result.agent.action === 'BOOKED' ? (
                <div className="result-card result-success">
                  <div className="result-icon">✅</div>
                  <div className="result-title">Appointment Booked!</div>
                  <div className="result-desc">
                    Your AI agent successfully scheduled an appointment with a {result.agent.recommendedSpecialty}.
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-label">Patient</span>
                      <span className="detail-value">{result.patient.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Doctor</span>
                      <span className="detail-value">Dr. {result.agent.doctor?.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Specialty</span>
                      <span className="detail-value">{result.agent.recommendedSpecialty}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{result.agent.slot?.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{result.agent.slot?.startTime} – {result.agent.slot?.endTime}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Urgency</span>
                      <span className={`detail-value urgency-${result.agent.urgency?.toLowerCase()}`}>
                        {result.agent.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="result-card result-flagged">
                  <div className="result-icon">⚠️</div>
                  <div className="result-title">Flagged for Review</div>
                  <div className="result-desc">{result.agent.message}</div>
                </div>
              )}

              {/* Always show agent reasoning */}
              <AgentThinking result={result} isThinking={false} />

              <button id="intake-reset" className="btn btn-secondary btn-full mt-4" onClick={reset}>
                ← Submit Another Intake
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

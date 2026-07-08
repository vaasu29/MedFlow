import { useState } from 'react'

const STEP_LABELS = [
  { icon: '🔍', label: 'Parsing symptoms', key: 'parsing' },
  { icon: '⚡', label: 'Classifying urgency', key: 'urgency' },
  { icon: '🩺', label: 'Identifying specialist', key: 'specialist' },
  { icon: '📅', label: 'Checking availability', key: 'availability' },
  { icon: '✅', label: 'Booking appointment', key: 'booking' },
]

export default function AgentThinking({ result, isThinking }) {
  const [confidenceAnimated] = useState(true)

  if (isThinking) {
    return (
      <div className="agent-panel mt-4">
        <div className="agent-header">
          <div className="agent-icon">🤖</div>
          <div>
            <div className="agent-title">AI Agent Processing</div>
            <div className="agent-subtitle flex items-center gap-2">
              Analyzing your symptoms <div className="thinking-dots"><span /><span /><span /></div>
            </div>
          </div>
        </div>
        <div className="agent-steps">
          {STEP_LABELS.map((step) => (
            <div className="agent-step" key={step.key}>
              <span className="step-icon">{step.icon}</span>
              <div>
                <div className="step-label">{step.label}</div>
                <div className="step-value">
                  <div className="thinking-dots"><span /><span /><span /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!result) return null

  const { agent } = result
  const urgencyClass = `urgency-${agent.urgency?.toLowerCase()}`
  const confidence = Math.round(agent.confidence * 100)

  return (
    <div className="agent-panel mt-4">
      <div className="agent-header">
        <div className="agent-icon">🤖</div>
        <div>
          <div className="agent-title">Agent Decision Report</div>
          <div className="agent-subtitle">Processed in {agent.processingTimeMs}ms</div>
        </div>
        <span className={`badge ${agent.action === 'BOOKED' ? 'badge-scheduled' : 'badge-medium'}`} style={{ marginLeft: 'auto' }}>
          {agent.action === 'BOOKED' ? '✅ Booked' : '⚠️ Flagged'}
        </span>
      </div>

      <div className="agent-steps">
        <div className="agent-step">
          <span className="step-icon">🔍</span>
          <div style={{ flex: 1 }}>
            <div className="step-label">Parsed Symptoms</div>
            <div className="step-value">{agent.parsedSymptoms?.summary}</div>
            {agent.parsedSymptoms?.duration && (
              <div className="text-xs text-muted mt-1">Duration: {agent.parsedSymptoms.duration}</div>
            )}
          </div>
        </div>

        <div className="agent-step">
          <span className="step-icon">⚡</span>
          <div style={{ flex: 1 }}>
            <div className="step-label">Urgency Classification</div>
            <div className={`step-value ${urgencyClass}`}>{agent.urgency}</div>
            <div className="text-xs text-muted mt-1">{agent.urgencyReason}</div>
          </div>
        </div>

        <div className="agent-step">
          <span className="step-icon">🩺</span>
          <div style={{ flex: 1 }}>
            <div className="step-label">Recommended Specialist</div>
            <div className="step-value">{agent.recommendedSpecialty}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted">Confidence</span>
                <span className="text-xs" style={{ color: 'var(--accent-primary)' }}>{confidence}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: confidenceAnimated ? `${confidence}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {agent.action === 'BOOKED' && agent.doctor && (
          <div className="agent-step">
            <span className="step-icon">📅</span>
            <div>
              <div className="step-label">Appointment Booked</div>
              <div className="step-value">Dr. {agent.doctor.name}</div>
              <div className="text-xs text-muted mt-1">
                {agent.slot?.date} at {agent.slot?.startTime} – {agent.slot?.endTime}
              </div>
            </div>
          </div>
        )}

        {agent.action === 'FLAGGED_FOR_REVIEW' && (
          <div className="agent-step">
            <span className="step-icon">⚠️</span>
            <div>
              <div className="step-label">Action</div>
              <div className="step-value urgency-high">Flagged for Human Review</div>
              <div className="text-xs text-muted mt-1">{agent.message}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const SPECIALTY_ICONS = {
  'Cardiologist':       '❤️',
  'Neurologist':        '🧠',
  'Pulmonologist':      '🫁',
  'Gastroenterologist': '🫃',
  'Orthopedist':        '🦴',
  'Dermatologist':      '🧴',
  'Psychiatrist':       '🧘',
  'Endocrinologist':    '⚗️',
  'General Physician':  '🩺',
  'Ophthalmologist':    '👁️',
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [selected, setSelected] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [docRes, specRes] = await Promise.all([
          axios.get(`${API}/api/doctors`),
          axios.get(`${API}/api/doctors/specialties`),
        ])
        setDoctors(docRes.data.doctors)
        setSpecialties(specRes.data.specialties)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = selected === 'ALL' ? doctors : doctors.filter(d => d.specialty === selected)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Medical Specialists</h1>
        <p className="page-subtitle">Browse doctors and their available appointment slots across all specialties</p>
      </div>

      {/* Filters */}
      <div className="filter-strip">
        <button
          id="filter-all"
          className={`btn btn-sm ${selected === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelected('ALL')}
        >
          All Specialties
        </button>
        {specialties.map(s => (
          <button
            key={s}
            id={`filter-${s.toLowerCase().replace(/\s+/g, '-')}`}
            className={`btn btn-sm ${selected === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelected(s)}
          >
            {SPECIALTY_ICONS[s] || '🩺'} {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /><span>Loading doctors…</span></div>
      ) : (
        <div className="doctor-grid">
          {filtered.map(doctor => {
            const avail = doctor.slots.filter(s => !s.isBooked)
            const dates = [...new Set(avail.map(s => s.date))].slice(0, 2)

            return (
              <div key={doctor.id} className="doctor-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="doc-avatar">{doctor.avatarInitials}</div>
                  <div>
                    <div className="doc-name">{doctor.name}</div>
                    <div className="doc-specialty">
                      {SPECIALTY_ICONS[doctor.specialty] || '🩺'} {doctor.specialty}
                    </div>
                  </div>
                </div>

                <p className="doc-bio">{doctor.bio}</p>

                <div style={{ marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Available Slots ({avail.length} open)
                  </div>

                  {dates.length === 0 ? (
                    <div className="text-xs text-muted">No slots currently available</div>
                  ) : (
                    dates.map(date => {
                      const daySlots = avail.filter(s => s.date === date)
                      return (
                        <div key={date} style={{ marginBottom: '0.5rem' }}>
                          <div className="text-xs text-muted mb-1">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })}
                          </div>
                          <div className="slot-chips">
                            {daySlots.slice(0, 5).map(slot => (
                              <span key={slot.id} className="slot-chip">{slot.startTime}</span>
                            ))}
                            {daySlots.length > 5 && (
                              <span className="slot-chip">+{daySlots.length - 5}</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className={`badge ${doctor.available ? 'b-scheduled' : 'b-cancelled'}`}>
                    {doctor.available ? '● Available' : '● Unavailable'}
                  </span>
                  <span className="text-xs text-muted">{doctor._count?.appointments || 0} appointments</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const SPECIALTY_ICONS = {
  'Cardiologist': '❤️',
  'Neurologist': '🧠',
  'Pulmonologist': '🫁',
  'Gastroenterologist': '🫃',
  'Orthopedist': '🦴',
  'Dermatologist': '🧴',
  'Psychiatrist': '🧘',
  'Endocrinologist': '⚗️',
  'General Physician': '🩺',
  'Ophthalmologist': '👁️',
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL')
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
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = selectedSpecialty === 'ALL'
    ? doctors
    : doctors.filter((d) => d.specialty === selectedSpecialty)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Our Doctors</h1>
        <p className="page-subtitle">Browse specialists and their available appointment slots</p>
      </div>

      {/* Specialty filter */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button
          id="filter-all-specialties"
          className={`btn btn-sm ${selectedSpecialty === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedSpecialty('ALL')}
        >
          All Specialties
        </button>
        {specialties.map((s) => (
          <button
            key={s}
            id={`filter-specialty-${s.toLowerCase().replace(/\s+/g, '-')}`}
            className={`btn btn-sm ${selectedSpecialty === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSpecialty(s)}
          >
            {SPECIALTY_ICONS[s] || '🩺'} {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading doctors…</span></div>
      ) : (
        <div className="doctor-grid">
          {filtered.map((doctor) => {
            const availableSlots = doctor.slots.filter((s) => !s.isBooked)
            const upcomingDates = [...new Set(availableSlots.map((s) => s.date))].slice(0, 3)

            return (
              <div key={doctor.id} className="doctor-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="doctor-avatar">{doctor.avatarInitials}</div>
                  <div>
                    <div className="doctor-name">{doctor.name}</div>
                    <div className="doctor-specialty">
                      {SPECIALTY_ICONS[doctor.specialty] || '🩺'} {doctor.specialty}
                    </div>
                  </div>
                </div>

                <p className="doctor-bio">{doctor.bio}</p>

                <div style={{ marginTop: '1rem' }}>
                  <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Available Slots ({availableSlots.length} open)
                  </div>

                  {upcomingDates.length === 0 ? (
                    <div className="text-xs text-muted">No slots available</div>
                  ) : (
                    upcomingDates.map((date) => {
                      const daySlots = availableSlots.filter((s) => s.date === date)
                      return (
                        <div key={date} style={{ marginBottom: '0.6rem' }}>
                          <div className="text-xs text-muted mb-1">{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                          <div className="slot-list">
                            {daySlots.slice(0, 5).map((slot) => (
                              <span key={slot.id} className={`slot-chip ${slot.isBooked ? 'booked' : ''}`}>
                                {slot.startTime}
                              </span>
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

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-center">
                    <span className={`badge ${doctor.available ? 'badge-scheduled' : 'badge-cancelled'}`}>
                      {doctor.available ? '● Available' : '● Unavailable'}
                    </span>
                    <span className="text-xs text-muted">{doctor._count?.appointments || 0} appointments</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

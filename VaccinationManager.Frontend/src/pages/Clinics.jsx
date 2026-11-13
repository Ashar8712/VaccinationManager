import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Loader from '../components/Loader'
import { createClinic, deleteClinic, getClinics, setClinicStatus, updateClinic } from '../services/clinicService'

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const dayShortMap = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}
const emptyForm = {
  clinicName: '',
  phoneNumber: '',
  email: '',
  city: '',
  fullAddress: '',
  consultationFee: '0',
  totalBeds: '0',
  startTime: '09:00',
  endTime: '17:00',
  workingDays: [],
  isActive: true,
}

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value || 0))

const formatTime = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && value.length === 5) return `${value}:00`
  return value
}

const formatClock = (value) => value?.slice(0, 5) || '09:00'

const normalizeWorkingDays = (days = []) => {
  if (!Array.isArray(days)) return []
  const selectedDays = days
    .filter(Boolean)
    .map((day) => day.trim())
    .map((day) => dayOrder.find((orderedDay) => orderedDay.toLowerCase() === day.toLowerCase()))
    .filter(Boolean)

  return dayOrder.filter((day) => selectedDays.includes(day))
}

const getErrorMessage = (error) => {
  const data = error?.response?.data

  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.title) return data.title

  const validationMessage = Object.values(data?.errors || {})
    .flat()
    .find(Boolean)

  return validationMessage || 'Something went wrong. Please try again.'
}

export default function Clinics() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [editingClinic, setEditingClinic] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const activeClinicCount = useMemo(
    () => clinics.filter((clinic) => clinic.isActive).length,
    [clinics],
  )
  const activeClinic = clinics.find((clinic) => clinic.isActive)

  const loadClinics = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getClinics()
      setClinics(Array.isArray(data) ? data : [])
    } catch (apiError) {
      setClinics([])
      setError(getErrorMessage(apiError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClinics()
  }, [])

  useEffect(() => {
    if (!modalOpen && !deleteModal) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
        setDeleteModal(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteModal, modalOpen])

  const openAddModal = () => {
    setEditingClinic(null)
    setForm({ ...emptyForm, workingDays: [] })
    setFormError('')
    setSuccess('')
    setModalOpen(true)
  }

  const openEditModal = (clinic) => {
    setEditingClinic(clinic)
    setForm({
      clinicName: clinic.clinicName || '',
      phoneNumber: clinic.phoneNumber || '',
      email: clinic.email || '',
      city: clinic.city || '',
      fullAddress: clinic.fullAddress || '',
      consultationFee: String(clinic.consultationFee ?? 0),
      totalBeds: String(clinic.totalBeds ?? 0),
      startTime: clinic.startTime ? clinic.startTime.slice(0, 5) : '09:00',
      endTime: clinic.endTime ? clinic.endTime.slice(0, 5) : '17:00',
      workingDays: normalizeWorkingDays(clinic.workingDays || []),
      isActive: Boolean(clinic.isActive),
    })
    setFormError('')
    setSuccess('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingClinic(null)
    setForm({ ...emptyForm, workingDays: [] })
    setFormError('')
  }

  const handleWorkingDayToggle = (day) => {
    setForm((current) => ({
      ...current,
      workingDays: current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : [...current.workingDays, day],
    }))
  }

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const buildPayload = () => ({
    clinicName: form.clinicName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    email: form.email.trim(),
    city: form.city.trim(),
    fullAddress: form.fullAddress.trim(),
    consultationFee: Number(form.consultationFee),
    totalBeds: Math.trunc(Number(form.totalBeds)),
    startTime: formatTime(form.startTime),
    endTime: formatTime(form.endTime),
    workingDays: form.workingDays,
    isActive: form.isActive,
  })

  const submitClinic = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (editingClinic) {
        await updateClinic(editingClinic.id, buildPayload())
        setSuccess('Clinic updated successfully.')
      } else {
        await createClinic(buildPayload())
        setSuccess('Clinic added successfully.')
      }

      closeModal()
      await loadClinics()
    } catch (apiError) {
      setFormError(getErrorMessage(apiError))
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setSubmitting(true)
    try {
      await deleteClinic(deleteModal.id)
      setSuccess('Clinic deleted successfully.')
      setDeleteModal(null)
      await loadClinics()
    } catch (apiError) {
      setError(getErrorMessage(apiError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusToggle = async (clinic) => {
    const nextStatus = !clinic.isActive
    setStatusLoadingId(clinic.id)
    setSuccess('')
    setClinics((current) => current.map((item) => (
      item.id === clinic.id ? { ...item, isActive: nextStatus } : item
    )))

    try {
      await setClinicStatus(clinic.id, nextStatus)
      setSuccess(nextStatus ? 'Clinic activated successfully.' : 'Clinic deactivated successfully.')
      await loadClinics()
    } catch (apiError) {
      setClinics((current) => current.map((item) => (
        item.id === clinic.id ? { ...item, isActive: clinic.isActive } : item
      )))
      setError(getErrorMessage(apiError))
    } finally {
      setStatusLoadingId(null)
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">Menu</button>
          <div>
            <p className="header-kicker">Healthcare operations</p>
            <h1>Clinic Management</h1>
          </div>
          <div className="header-actions">
            <div className="avatar">DR</div>
            <div className="user-meta">
              <strong>Dr Ashar</strong>
              <span>Medical practitioner</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content clinics-page" aria-busy={loading}>
          <div className="page-header-bar">
            <div>
              <p className="kicker">Locations and schedules</p>
              <h2>Manage clinic locations, schedules, and availability.</h2>
            </div>
            <button className="primary-button" onClick={openAddModal}>+ Add Clinic</button>
          </div>

          {success && <div className="alert alert-success form-alert" role="status">{success}</div>}
          {error && <div className="alert alert-danger form-alert" role="alert">{error}</div>}

          <div className="clinic-summary-grid">
            <div className="summary-card summary-card--blue">
              <span>Total clinics</span>
              <strong>{clinics.length}</strong>
            </div>
            <div className="summary-card summary-card--teal">
              <span>Active clinics</span>
              <strong>{activeClinicCount}</strong>
            </div>
            <div className="summary-card summary-card--amber">
              <span>Active schedule</span>
              <strong>{activeClinic ? `${formatClock(activeClinic.startTime)} - ${formatClock(activeClinic.endTime)}` : 'No active clinic'}</strong>
            </div>
          </div>

          {loading ? (
            <div className="loader-panel">
              <Loader />
              <span>Loading clinics...</span>
            </div>
          ) : clinics.length === 0 ? (
            <div className="empty-clinic-state">
              <div className="empty-icon">+</div>
              <h3>No clinics added yet.</h3>
              <p>Add your first clinic to start managing your practice.</p>
              <button className="primary-button" onClick={openAddModal}>+ Add Clinic</button>
            </div>
          ) : (
            <div className="clinic-grid">
              {clinics.map((clinic) => (
                <article key={clinic.id} className={`clinic-card ${clinic.isActive ? 'clinic-card--active' : ''}`}>
                  <div className="clinic-card-top">
                    <div>
                      <div className="clinic-title-row">
                        <h3>{clinic.clinicName}</h3>
                        <span className={`status-badge ${clinic.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                          {clinic.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="clinic-location">{clinic.city}</p>
                    </div>

                    <div className="clinic-action-buttons">
                      <button type="button" className="icon-button" onClick={() => openEditModal(clinic)} aria-label={`Edit ${clinic.clinicName}`}>Edit</button>
                      <button type="button" className="icon-button danger" onClick={() => setDeleteModal(clinic)} aria-label={`Delete ${clinic.clinicName}`}>Delete</button>
                    </div>
                  </div>

                  <p className="clinic-address">{clinic.fullAddress || 'Address not provided'}</p>

                  <div className="clinic-facts">
                    <div className="clinic-fact"><small>Phone</small><strong>{clinic.phoneNumber}</strong></div>
                    <div className="clinic-fact"><small>Email</small><strong>{clinic.email}</strong></div>
                    <div className="clinic-fact"><small>Consultation</small><strong>{formatCurrency(clinic.consultationFee)}</strong></div>
                    <div className="clinic-fact"><small>Beds</small><strong>{clinic.totalBeds}</strong></div>
                    <div className="clinic-fact"><small>Hours</small><strong>{formatClock(clinic.startTime)} - {formatClock(clinic.endTime)}</strong></div>
                  </div>

                  <div className="working-days-wrap">
                    <span className="section-label">Working days</span>
                    <div className="working-days-inline">
                      {normalizeWorkingDays(clinic.workingDays).map((day) => (
                        <span key={`${clinic.id}-${day}`} className="working-day-chip">{dayShortMap[day]}</span>
                      ))}
                    </div>
                  </div>

                  <div className="clinic-card-footer">
                    <div className="toggle-row">
                      <span>{clinic.isActive ? 'Active clinic' : 'Inactive clinic'}</span>
                      <button
                        type="button"
                        className={`status-switch ${clinic.isActive ? 'status-switch--on' : ''}`}
                        onClick={() => handleStatusToggle(clinic)}
                        disabled={statusLoadingId === clinic.id}
                        aria-label={clinic.isActive ? `Deactivate ${clinic.clinicName}` : `Activate ${clinic.clinicName}`}
                        aria-checked={clinic.isActive}
                        role="switch"
                      >
                        <span className="status-switch__thumb" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="custom-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="kicker">{editingClinic ? 'Update clinic' : 'Add clinic'}</p>
                <h3>{editingClinic ? 'Edit clinic details' : 'Create a new clinic'}</h3>
              </div>
              <button type="button" className="icon-button close-button" onClick={closeModal} aria-label="Close dialog">Close</button>
            </div>

            <form onSubmit={submitClinic} className="clinic-form">
              {formError && <div className="alert alert-danger form-alert" role="alert">{formError}</div>}

              <div className="form-grid">
                <div className="field-group full">
                  <label htmlFor="clinicName">Clinic name</label>
                  <input id="clinicName" name="clinicName" value={form.clinicName} onChange={handleFieldChange} placeholder="City Care Clinic" />
                </div>

                <div className="field-group">
                  <label htmlFor="phoneNumber">Phone number</label>
                  <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFieldChange} placeholder="03001234567" />
                </div>

                <div className="field-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" value={form.email} onChange={handleFieldChange} placeholder="hello@clinic.com" />
                </div>

                <div className="field-group">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" value={form.city} onChange={handleFieldChange} placeholder="Lahore" />
                </div>

                <div className="field-group full">
                  <label htmlFor="fullAddress">Full address</label>
                  <textarea id="fullAddress" name="fullAddress" value={form.fullAddress} onChange={handleFieldChange} rows="3" placeholder="Street address, sector, landmark" />
                </div>

                <div className="field-group">
                  <label htmlFor="consultationFee">Consultation fee</label>
                  <input id="consultationFee" name="consultationFee" type="number" min="0" step="0.01" value={form.consultationFee} onChange={handleFieldChange} placeholder="0" />
                </div>

                <div className="field-group">
                  <label htmlFor="totalBeds">Total beds</label>
                  <input id="totalBeds" name="totalBeds" type="number" min="0" value={form.totalBeds} onChange={handleFieldChange} placeholder="0" />
                </div>

                <div className="field-group">
                  <label htmlFor="startTime">Start time</label>
                  <input id="startTime" name="startTime" type="time" value={form.startTime} onChange={handleFieldChange} />
                </div>

                <div className="field-group">
                  <label htmlFor="endTime">End time</label>
                  <input id="endTime" name="endTime" type="time" value={form.endTime} onChange={handleFieldChange} />
                </div>

                <div className="field-group full">
                  <span className="field-group-label">Working days</span>
                  <div className="weekday-selector">
                    {dayOrder.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`weekday-chip ${form.workingDays.includes(day) ? 'weekday-chip--selected' : ''}`}
                        onClick={() => handleWorkingDayToggle(day)}
                        aria-pressed={form.workingDays.includes(day)}
                      >
                        {dayShortMap[day]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group full toggle-row-field">
                  <label htmlFor="isActive">Active clinic</label>
                  <label className="switch-checkbox">
                    <input id="isActive" name="isActive" type="checkbox" checked={form.isActive} onChange={handleFieldChange} />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? (editingClinic ? 'Saving...' : 'Adding...') : (editingClinic ? 'Save Changes' : 'Add Clinic')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="custom-modal alert-modal" onClick={(event) => event.stopPropagation()}>
            <p className="kicker">Delete clinic</p>
            <h3>Delete {deleteModal.clinicName}?</h3>
            <p className="modal-text">This action cannot be undone and the clinic will be removed from your profile.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button type="button" className="danger-button" onClick={confirmDelete} disabled={submitting}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Loader from '../components/Loader'
import { createPatient, deletePatient, getPatients, updatePatient } from '../services/patientService'

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Gujranwala', 'Hyderabad', 'Sialkot', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Gujrat', 'Mardan', 'Kasur', 'Abbottabad', 'Okara', 'Wah Cantonment',
  'Dera Ghazi Khan', 'Sahiwal', 'Nawabshah', 'Mirpur Khas', 'Bannu',
  'Mingora', 'Muzaffarabad', 'Chiniot', 'Kamoke', 'Hafizabad', 'Sadiqabad',
  'Khanewal', 'Khuzdar', 'Pakpattan', 'Jacobabad', 'Shikarpur',
]

const emptyForm = {
  patientName: '',
  fatherGuardianName: '',
  dateOfBirth: '',
  fatherCnic: '',
  city: '',
  phoneNumber: '',
}

const cnicPattern = /^\d{5}-?\d{7}-?\d$/
const phonePattern = /^(\+92|0)?3\d{9}$/

const formatDate = (value) => {
  if (!value) return 'Not provided'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Not provided'
  return new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const getAge = (value) => {
  if (!value) return ''
  const birthDate = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  const today = new Date()
  if (Number.isNaN(birthDate.getTime())) return ''
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age >= 0 ? `(${age})` : ''
}

const getErrorMessage = (error) => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.title) return data.title
  const validationMessage = Object.values(data?.errors || {}).flat().find(Boolean)
  return validationMessage || 'Something went wrong. Please try again.'
}

const PatientIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5.5 20c.7-3.3 3.1-5 6.5-5s5.8 1.7 6.5 5" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
)

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 7h14M10 4h4M8 7l.7 12h6.6L16 7M10.5 10v6M13.5 10v6" />
  </svg>
)

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [cityOpen, setCityOpen] = useState(false)
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1)
  const cityInputRef = useRef(null)

  const citySuggestions = useMemo(() => {
    const query = form.city.trim().toLowerCase()
    return pakistanCities
      .filter((city) => city.toLowerCase().includes(query))
      .slice(0, 8)
  }, [form.city])

  const cityCount = useMemo(
    () => new Set(patients.map((patient) => patient.city).filter(Boolean)).size,
    [patients],
  )
  const recentPatientCount = useMemo(() => {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000)
    return patients.filter((patient) => new Date(patient.createdAt).getTime() >= cutoff).length
  }, [patients])

  const loadPatients = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getPatients()
      setPatients(Array.isArray(data) ? data : [])
    } catch (apiError) {
      setPatients([])
      setError(getErrorMessage(apiError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (!modalOpen && !deleteModal) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
        setDeleteModal(null)
        setCityOpen(false)
      }
    }
    const handleOutsideClick = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) setCityOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [deleteModal, modalOpen])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setFormError('')
    setCityOpen(false)
    setHighlightedCityIndex(-1)
  }

  const openAddModal = () => {
    setEditingPatient(null)
    resetForm()
    setSuccess('')
    setModalOpen(true)
  }

  const openEditModal = (patient) => {
    setEditingPatient(patient)
    setForm({
      patientName: patient.patientName || '',
      fatherGuardianName: patient.fatherGuardianName || '',
      dateOfBirth: patient.dateOfBirth ? String(patient.dateOfBirth).slice(0, 10) : '',
      fatherCnic: patient.fatherCnic || '',
      city: patient.city || '',
      phoneNumber: patient.phoneNumber || '',
    })
    setFormError('')
    setSuccess('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPatient(null)
    resetForm()
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCityChange = (event) => {
    setForm((current) => ({ ...current, city: event.target.value }))
    setCityOpen(true)
    setHighlightedCityIndex(-1)
  }

  const handleCityFocus = () => {
    setCityOpen(true)
    setHighlightedCityIndex(-1)
  }

  const handleCityKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (citySuggestions.length) {
        setCityOpen(true)
        setHighlightedCityIndex((current) => (current + 1) % citySuggestions.length)
      }
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (citySuggestions.length) {
        setCityOpen(true)
        setHighlightedCityIndex((current) => (current - 1 + citySuggestions.length) % citySuggestions.length)
      }
      return
    }
    if (event.key === 'Enter' && cityOpen && highlightedCityIndex >= 0 && citySuggestions[highlightedCityIndex]) {
      event.preventDefault()
      selectCity(citySuggestions[highlightedCityIndex])
      return
    }
    if (event.key === 'Escape') setCityOpen(false)
  }

  const selectCity = (city) => {
    setForm((current) => ({ ...current, city }))
    setCityOpen(false)
    setHighlightedCityIndex(-1)
    cityInputRef.current?.focus()
  }

  const validateForm = () => {
    if (!form.patientName.trim()) return 'Patient name is required.'
    if (!form.fatherGuardianName.trim()) return 'Father or guardian name is required.'
    if (!form.dateOfBirth) return 'Date of birth is required.'
    if (new Date(`${form.dateOfBirth}T00:00:00`) > new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00`)) return 'Date of birth cannot be in the future.'
    if (!cnicPattern.test(form.fatherCnic.trim())) return 'Father CNIC must be a valid 13-digit CNIC.'
    if (!form.city.trim()) return 'City is required.'
    if (!phonePattern.test(form.phoneNumber.trim())) return 'Phone number must be a valid Pakistani mobile number.'
    return ''
  }

  const buildPayload = () => ({
    PatientName: form.patientName.trim(),
    FatherGuardianName: form.fatherGuardianName.trim(),
    DateOfBirth: form.dateOfBirth,
    FatherCnic: form.fatherCnic.trim(),
    City: form.city.trim(),
    PhoneNumber: form.phoneNumber.trim(),
  })

  const submitPatient = async (event) => {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError('')
    setSuccess('')
    setSubmitting(true)
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, buildPayload())
        setSuccess('Patient updated successfully.')
      } else {
        await createPatient(buildPayload())
        setSuccess('Patient registered successfully.')
      }
      closeModal()
      await loadPatients()
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
      await deletePatient(deleteModal.id)
      setSuccess('Patient deleted successfully.')
      setDeleteModal(null)
      await loadPatients()
    } catch (apiError) {
      setError(getErrorMessage(apiError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">Menu</button>
          <div>
            <p className="header-kicker">Care records</p>
            <h1>Patients Management</h1>
          </div>
          <div className="header-actions">
            <div className="avatar">DR</div>
            <div className="user-meta">
              <strong>Dr Ashar</strong>
              <span>Medical practitioner</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content patients-page" aria-busy={loading}>
          <div className="page-header-bar">
            <div>
              <p className="kicker">Patient records</p>
              <h2>Manage patient details, guardian information, and contact records.</h2>
            </div>
            <button className="primary-button" onClick={openAddModal}>+ Register New Patient</button>
          </div>

          {success && <div className="alert alert-success form-alert" role="status">{success}</div>}
          {error && <div className="alert alert-danger form-alert" role="alert">{error}</div>}

          <div className="patient-summary-grid">
            <div className="summary-card summary-card--blue">
              <span>Total patients</span>
              <strong>{patients.length}</strong>
            </div>
            <div className="summary-card summary-card--teal">
              <span>Cities represented</span>
              <strong>{cityCount}</strong>
            </div>
            <div className="summary-card summary-card--amber">
              <span>Added in last 30 days</span>
              <strong>{recentPatientCount}</strong>
            </div>
          </div>

          {loading ? (
            <div className="loader-panel">
              <Loader />
              <span>Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-patient-state">
              <div className="empty-patient-icon"><PatientIcon /></div>
              <h3>No patients added yet.</h3>
              <p>Register your first patient to keep care records organized and accessible.</p>
              <button className="primary-button" onClick={openAddModal}>+ Register New Patient</button>
            </div>
          ) : (
            <div className="patient-grid">
              {patients.map((patient) => (
                <article key={patient.id} className="patient-card">
                  <div className="patient-icon" aria-hidden="true"><PatientIcon /></div>
                  <div className="patient-card-content">
                    <div className="patient-card-heading">
                      <div className="patient-identity">
                        <h3>{patient.patientName}</h3>
                        <p>Guardian: {patient.fatherGuardianName}</p>
                      </div>
                      <div className="patient-actions">
                        <button type="button" className="patient-action-button" onClick={() => openEditModal(patient)} aria-label={`Edit ${patient.patientName}`}>
                          <EditIcon /><span>Edit</span>
                        </button>
                        <button type="button" className="patient-action-button patient-action-button--danger" onClick={() => setDeleteModal(patient)} aria-label={`Delete ${patient.patientName}`}>
                          <DeleteIcon /><span>Delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="patient-details">
                      <div className="patient-detail">
                        <span>Date of birth</span>
                        <strong>{formatDate(patient.dateOfBirth)} {getAge(patient.dateOfBirth)}</strong>
                      </div>
                      <div className="patient-detail">
                        <span>Father CNIC</span>
                        <strong>{patient.fatherCnic || 'Not provided'}</strong>
                      </div>
                      <div className="patient-detail">
                        <span>City</span>
                        <strong>{patient.city || 'Not provided'}</strong>
                      </div>
                      <div className="patient-detail">
                        <span>Phone number</span>
                        <strong>{patient.phoneNumber || 'Not provided'}</strong>
                      </div>
                      <div className="patient-detail patient-detail--wide">
                        <span>Registered</span>
                        <strong>{formatDate(patient.createdAt)}</strong>
                      </div>
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
          <div className="custom-modal patient-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="kicker">{editingPatient ? 'Update record' : 'New patient'}</p>
                <h3>{editingPatient ? 'Edit patient details' : 'Register a new patient'}</h3>
              </div>
              <button type="button" className="icon-button close-button" onClick={closeModal} aria-label="Close dialog">Close</button>
            </div>
            <form className="clinic-form patient-form" onSubmit={submitPatient}>
              {formError && <div className="alert alert-danger form-alert" role="alert">{formError}</div>}
              <div className="form-grid">
                <div className="field-group">
                  <label htmlFor="patientName">Patient name</label>
                  <input id="patientName" name="patientName" value={form.patientName} onChange={handleFieldChange} placeholder="Enter patient name" required />
                </div>
                <div className="field-group">
                  <label htmlFor="fatherGuardianName">Father / guardian name</label>
                  <input id="fatherGuardianName" name="fatherGuardianName" value={form.fatherGuardianName} onChange={handleFieldChange} placeholder="Enter guardian name" required />
                </div>
                <div className="field-group">
                  <label htmlFor="dateOfBirth">Date of birth</label>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleFieldChange} max={new Date().toISOString().slice(0, 10)} required />
                </div>
                <div className="field-group">
                  <label htmlFor="fatherCnic">Father CNIC</label>
                  <input id="fatherCnic" name="fatherCnic" value={form.fatherCnic} onChange={handleFieldChange} placeholder="35202-1234567-1" inputMode="numeric" required />
                </div>
                <div className="field-group city-field-group">
                  <label htmlFor="city">City</label>
                  <div className="city-autocomplete" ref={cityInputRef}>
                    <input id="city" name="city" value={form.city} onChange={handleCityChange} onFocus={handleCityFocus} onKeyDown={handleCityKeyDown} placeholder="Search or type city" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={cityOpen} aria-controls="city-suggestions" required />
                    {cityOpen && (
                      <div id="city-suggestions" className="city-suggestions" role="listbox">
                        {citySuggestions.map((city, index) => (
                          <button type="button" key={city} className={`city-option ${highlightedCityIndex === index ? 'city-option--highlighted' : ''}`} onMouseDown={(event) => event.preventDefault()} onClick={() => selectCity(city)} role="option" aria-selected={highlightedCityIndex === index}>
                            <span className="city-option-mark">C</span>{city}
                          </button>
                        ))}
                        {citySuggestions.length === 0 && <div className="city-no-result">No suggested cities. You can type any city name.</div>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="phoneNumber">Phone number</label>
                  <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFieldChange} placeholder="03001234567" inputMode="tel" required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-button" disabled={submitting}>{submitting ? (editingPatient ? 'Saving...' : 'Registering...') : (editingPatient ? 'Save Changes' : 'Register Patient')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="custom-modal alert-modal patient-alert-modal" onClick={(event) => event.stopPropagation()}>
            <div className="delete-icon" aria-hidden="true"><DeleteIcon /></div>
            <p className="kicker">Delete patient</p>
            <h3>Delete {deleteModal.patientName}?</h3>
            <p className="modal-text">This will permanently remove the patient record from your practice. This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button type="button" className="danger-button" onClick={confirmDelete} disabled={submitting}>Delete Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

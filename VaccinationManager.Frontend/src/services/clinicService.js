import api from './api'

export const getClinics = () => api.get('/Clinic')
export const getClinicById = (id) => api.get(`/Clinic/${id}`)
export const createClinic = (data) => api.post('/Clinic', data)
export const updateClinic = (id, data) => api.put(`/Clinic/${id}`, data)
export const deleteClinic = (id) => api.delete(`/Clinic/${id}`)
export const setClinicStatus = (id, isActive) => api.patch(`/Clinic/${id}/status?isActive=${isActive}`)

import api from './api'

export const getPatients = () => api.get('/Patient')
export const getPatientById = (id) => api.get(`/Patient/${id}`)
export const createPatient = (data) => api.post('/Patient', data)
export const updatePatient = (id, data) => api.put(`/Patient/${id}`, data)
export const deletePatient = (id) => api.delete(`/Patient/${id}`)

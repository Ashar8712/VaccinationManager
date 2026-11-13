import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5253'
const API_BASE_PATH = import.meta.env.DEV ? '/api' : `${API_BASE_URL}/api`

const api = axios.create({
  baseURL: API_BASE_PATH,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vaccination_manager_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

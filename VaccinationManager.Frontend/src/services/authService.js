import api from './api'

export const registerDoctor = (data) => api.post('/Auth/register', data)
export const verifyOtp = (data) => api.post('/Auth/verify-otp', data)
export const loginDoctor = (data) => api.post('/Auth/login', data)
export const forgotPassword = (data) => api.post('/Auth/forgot-password', data)
export const verifyForgotPasswordOtp = (data) => api.post('/Auth/verify-forgot-password-otp', data)
export const resetPassword = (data) => api.post('/Auth/reset-password', data)

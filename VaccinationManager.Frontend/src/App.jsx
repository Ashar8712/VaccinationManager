import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Clinics from './pages/Clinics'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Patients from './pages/Patients'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'
import VerifyForgotPasswordOtp from './pages/VerifyForgotPasswordOtp'
import VerifyOtp from './pages/VerifyOtp'

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-forgot-password-otp" element={<VerifyForgotPasswordOtp />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clinics" element={<Clinics />} />
      <Route path="/patients" element={<Patients />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
}

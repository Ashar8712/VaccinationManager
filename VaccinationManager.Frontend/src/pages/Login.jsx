import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Loader from '../components/Loader'
import PasswordField from '../components/PasswordField'
import { loginDoctor } from '../services/authService'

const initial = { countryCode: '+92', phoneNumber: '', password: '' }
const getError = (error) => {
  if (typeof error?.response?.data === 'string') return error.response.data
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data?.title) return error.response.data.title
  if (error?.message === 'Network Error') return 'Unable to reach the server. Please start the backend and try again.'
  return 'Unable to sign in. Please verify your phone number, password, and email verification status.'
}

export default function Login() {
  const [form, setForm] = useState(initial); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const navigate = useNavigate(); const location = useLocation()
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => { event.preventDefault(); setError(''); if (!form.phoneNumber || !form.password) return setError('Please enter your phone number and password.'); setLoading(true); try { const { data } = await loginDoctor(form); localStorage.setItem('vaccination_manager_token', data.token); navigate('/dashboard', { replace: true }) } catch (apiError) { setError(getError(apiError)) } finally { setLoading(false) } }
  return <AuthLayout eyebrow="Welcome back" title="Sign in to your workspace" description="Pick up where you left off and keep care moving forward."><form onSubmit={submit} noValidate>{location.state?.message && <div className="alert alert-success form-alert">{location.state.message}</div>}{error && <div className="alert alert-danger form-alert">{error}</div>}<div className="field-group"><label htmlFor="countryCode">Country code</label><select id="countryCode" name="countryCode" value={form.countryCode} onChange={update}><option>+92</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option><option>+91</option></select></div><div className="field-group"><label htmlFor="phoneNumber">Mobile number</label><input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={update} placeholder="Enter mobile number" autoComplete="tel" /></div><PasswordField label="Password" name="password" value={form.password} onChange={update} /><div className="form-options"><span /> <Link to="/forgot-password">Forgot password?</Link></div><button className="primary-button" disabled={loading}>{loading ? <><Loader /> Signing in...</> : 'Sign in'}</button><p className="form-switch">Don’t have an account? <Link to="/signup">Create one</Link></p></form></AuthLayout>
}

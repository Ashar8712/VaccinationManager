import { useState } from 'react'

export default function PasswordField({ label, name, value, onChange, error, placeholder = 'Enter password', minLength }) {
  const [visible, setVisible] = useState(false)
  return <div className="field-group"><label htmlFor={name}>{label}</label><div className="password-wrap"><input id={name} name={name} type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} minLength={minLength} required className={error ? 'is-invalid' : ''} /><button type="button" className="visibility-button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? '◉' : '◌'}</button></div>{error && <div className="field-error">{error}</div>}</div>
}

import { NavLink, useNavigate } from 'react-router-dom'

const menuItems = [
  ['Dashboard', '◈', '/dashboard'],
  ['Clinics', '✚', '/clinics'],
  ['Doctor Profile', '○', '#'],
  ['Vaccinations', '✚', '#'],
  ['Patients', '♧', '/patients'],
  ['Appointments', '▣', '#'],
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('vaccination_manager_token')
    navigate('/login', { replace: true })
  }

  return <>
    {open && <button className="sidebar-backdrop d-lg-none" aria-label="Close menu" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-mark"><span>✚</span><div>Vaccination<strong>Manager</strong></div></div>
      <p className="sidebar-label">Workspace</p>
      <nav className="sidebar-nav">
        {menuItems.map(([label, icon, path]) => path === '#' ? (
          <a href="#" key={label} onClick={(event) => event.preventDefault()}><span className="nav-icon">{icon}</span>{label}<small>Soon</small></a>
        ) : (
          <NavLink to={path} key={label} onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="support-note"><span>?</span><div><strong>Need help?</strong><small>Contact support</small></div></div>
        <button className="logout-button" onClick={logout}><span>↪</span>Log out</button>
      </div>
    </aside>
  </>
}

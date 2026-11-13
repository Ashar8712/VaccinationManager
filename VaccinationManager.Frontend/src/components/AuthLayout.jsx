export default function AuthLayout({ eyebrow, title, description, children }) {
  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="visual-top"><div className="brand-mark light"><span>✚</span><div>Vaccination<strong>Manager</strong></div></div><span className="secure-chip">● Secure workspace</span></div>
      <div className="visual-copy"><p className="kicker">Care, coordinated</p><h1>Better tools for<br /><em>healthier communities.</em></h1><p>Manage every step of patient care with clarity, confidence, and compassion.</p></div>
      <div className="visual-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="medical-cross">✚</div><div className="art-card"><span>Today’s care</span><strong>24</strong><small>appointments scheduled</small></div></div>
      <div className="visual-footer"><span>Trusted by healthcare professionals</span><span>●</span><span>Simple · Secure · Human</span></div>
    </section>
    <section className="auth-panel"><div className="auth-form-wrap"><div className="mobile-brand"><div className="brand-mark"><span>✚</span><div>Vaccination<strong>Manager</strong></div></div></div><p className="form-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="form-description">{description}</p>{children}</div></section>
  </main>
}

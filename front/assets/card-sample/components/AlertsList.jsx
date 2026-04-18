const AlertsList = () => (
  <div className="card">
    <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      アラート
      <span style={{ fontSize: 10, color: '#58a6ff', fontFamily: 'monospace', opacity: 0.7, textTransform: 'none', letterSpacing: 'normal', fontWeight: 'normal' }}>components/AlertsList.jsx</span>
    </div>
    {ALERTS.map((a, i) => (
      <div key={i} className={`alert-item ${a.level}`}>
        <span className="alert-icon">{a.icon}</span>
        <div className="alert-body">
          <div className="alert-title">{a.title}</div>
          <div className="alert-desc">{a.desc}</div>
        </div>
      </div>
    ))}
  </div>
);

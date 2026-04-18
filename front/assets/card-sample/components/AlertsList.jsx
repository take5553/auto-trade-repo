const AlertsList = () => (
  <div className="card">
    <div className="section-label">アラート</div>
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

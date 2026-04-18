const AlertCard = ({ alert }) => (
  <div className={`alert-card ${alert.level}`}>
    <div className={`alert-icon-wrap ${alert.level}`}>{alert.icon}</div>
    <div className="alert-body">
      <div className="alert-title">{alert.title}</div>
      <div className="alert-desc">{alert.desc}</div>
    </div>
    <span className="alert-time">{alert.time}</span>
  </div>
);

const ActivityFeed = () => (
  <div className="card">
    <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      取引履歴
      <span style={{ fontSize: 10, color: '#58a6ff', fontFamily: 'monospace', opacity: 0.7, textTransform: 'none', letterSpacing: 'normal', fontWeight: 'normal' }}>components/ActivityFeed.jsx</span>
    </div>
    <div className="feed">
      {FEED.map((f, i) => (
        <div key={i} className="feed-item">
          <div className={`feed-dot ${f.type}`} />
          <div>
            <div className="feed-text">{f.text}</div>
            <div className="feed-time">{f.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

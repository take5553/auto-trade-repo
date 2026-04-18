const ActivityFeed = () => (
  <div className="card">
    <div className="section-label">取引履歴</div>
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

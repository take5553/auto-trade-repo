const MarketOverview = () => (
  <div className="card market-card">
    <div className="section-label" style={{ marginBottom: 0 }}>マーケット概況</div>
    {MARKETS.map(m => (
      <div key={m.name} className="market-item">
        <span className="market-name">{m.name}</span>
        <span className="market-price">{m.price}</span>
        <span className={`market-change ${m.up ? 'up' : 'down'}`}>
          {m.up ? '+' : ''}{m.change}%
        </span>
      </div>
    ))}
  </div>
);

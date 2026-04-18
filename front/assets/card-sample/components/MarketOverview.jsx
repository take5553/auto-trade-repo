const MarketOverview = () => (
  <div className="card market-card">
    <div className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
      マーケット概況
      <span style={{ fontSize: 10, color: '#58a6ff', fontFamily: 'monospace', opacity: 0.7, textTransform: 'none', letterSpacing: 'normal', fontWeight: 'normal' }}>components/MarketOverview.jsx</span>
    </div>
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

const { useState, useEffect } = React;

const TABS = [
  { key: 'quotes',      label: '株価一覧' },
  { key: 'predictions', label: '売買シグナル' },
];

function App() {
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState('quotes');
  const [quotes, setQuotes] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/nikkei-core-50/quotes').then(r => r.json()),
      fetch('/api/nikkei-core-50/predictions').then(r => r.json()),
      fetch('/api/nikkei-core-50/summary').then(r => r.json()),
    ])
      .then(([q, p, s]) => {
        setQuotes(q);
        setPredictions(p);
        setSummary(s);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#f87171' }}>
        エラー: {error}
      </div>
    );
  }

  const buyCount  = predictions.filter(p => p.signal === 'buy').length;
  const sellCount = predictions.filter(p => p.signal === 'sell').length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          📈 日経コア50 ダッシュボード
        </div>
        <div className="header-right">
          <span className="badge live">● LIVE</span>
          <span className="badge">日経コア50</span>
          <span className="timestamp">{now.toLocaleTimeString('ja-JP')}</span>
        </div>
      </header>

      <div className="content">
        <MarketSummary summary={summary} />

        <div>
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.key === 'predictions' && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e' }}>
                    買 {buyCount} / 売 {sellCount}
                  </span>
                )}
                {t.key === 'quotes' && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e' }}>
                    {quotes.length}銘柄
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            {tab === 'quotes' && (
              <div className="card-list">
                {quotes.map(stock => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            )}

            {tab === 'predictions' && (
              <div className="card-list">
                {predictions
                  .slice()
                  .sort((a, b) => {
                    const order = { buy: 0, sell: 1, neutral: 2 };
                    return (order[a.signal] - order[b.signal]) || b.confidence - a.confidence;
                  })
                  .map(pred => (
                    <PredictionCard key={pred.symbol} pred={pred} />
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

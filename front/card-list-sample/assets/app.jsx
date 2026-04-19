function App() {
  const [now, setNow] = useState(new Date());
  const [positions, setPositions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/card-list/positions').then(r => r.json()),
      fetch('/api/card-list/alerts').then(r => r.json()),
      fetch('/api/card-list/summary').then(r => r.json()),
    ])
      .then(([pos, al, sum]) => {
        setPositions(pos);
        setAlerts(al);
        setSummary(sum);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="app" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#94a3b8'}}>読み込み中...</div>;
  }

  if (error) {
    return <div className="app" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#f87171'}}>エラー: {error}</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <IconChart />
          AutoTrade Dashboard
        </div>
        <div className="header-right">
          <span className="badge live">● LIVE</span>
          <span className="badge">Paper Trading</span>
          <span className="timestamp">{now.toLocaleTimeString('ja-JP')}</span>
        </div>
      </header>

      <div className="content">
        {/* Summary bar */}
        <SummaryBar summary={summary} />

        {/* Position list */}
        <div>
          <div className="section-label">オープンポジション</div>
          <div className="card-list">
            {positions.map(pos => (
              <PositionCard key={pos.id} pos={pos} />
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div>
          <div className="section-label">アラート</div>
          <div className="alert-list">
            {alerts.map((a, i) => (
              <AlertCard key={i} alert={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
        <SummaryBar summary={SUMMARY} />

        {/* Position list */}
        <div>
          <div className="section-label">オープンポジション</div>
          <div className="card-list">
            {POSITIONS.map(pos => (
              <PositionCard key={pos.id} pos={pos} />
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div>
          <div className="section-label">アラート</div>
          <div className="alert-list">
            {ALERTS.map((a, i) => (
              <AlertCard key={i} alert={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

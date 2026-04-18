function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const portfolioVal = LAST_EQUITY.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
          </svg>
          AutoTrade Dashboard
        </div>
        <div className="header-right">
          <span className="badge live">● LIVE</span>
          <span className="badge">Paper Trading</span>
          <span className="timestamp">{now.toLocaleTimeString('ja-JP')}</span>
        </div>
      </header>

      <div className="content">
        {/* KPI row */}
        <div>
          <div className="section-label">概要</div>
          <div className="kpi-row">
            <KpiCard
              title="本日の実現損益"
              value="+1,284.50"
              badge="+3.06%"
              badgeUp={true}
              sub="前日比"
              iconEl={<IconTrend />}
              iconClass="green"
            />
            <KpiCard
              title="ポートフォリオ残高"
              value={`$${portfolioVal}`}
              badge={`${EQUITY_CHANGE >= 0 ? '+' : ''}${EQUITY_CHANGE}%`}
              badgeUp={parseFloat(EQUITY_CHANGE) >= 0}
              sub="90日間"
              iconEl={<IconWallet />}
              iconClass="blue"
            />
            <KpiCard
              title="勝率"
              value="68.4%"
              badge="+2.1pt"
              badgeUp={true}
              sub="直近30トレード"
              iconEl={<IconTarget />}
              iconClass="amber"
            />
            <KpiCard
              title="オープンポジション"
              value={POSITIONS.length}
              sub="含み益 +$804.59"
              iconEl={<IconActivity />}
              iconClass="blue"
            />
          </div>
        </div>

        {/* Mid row */}
        <div className="mid-row">
          <div className="card">
            <div className="chart-card-title">エクイティカーブ</div>
            <div className="chart-card-sub">ポートフォリオ残高の推移（90日間）</div>
            <div className="sparkline-wrap">
              <EquityChart />
            </div>
          </div>
          <MarketOverview />
        </div>

        {/* Bottom row */}
        <div className="bottom-row">
          <PositionsTable />
          <ActivityFeed />
          <AlertsList />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

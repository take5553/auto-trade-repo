var { useRef, useEffect, useState } = React;

/* ── Icons ── */
var IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);

var IconWallet = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h2" />
  </svg>
);

var IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

var IconActivity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

/* ── KPI Card ── */
var KpiCard = ({ title, value, sub, badge, badgeUp, iconEl, iconClass }) => (
  <div className="card kpi-card">
    <div className="kpi-header">
      <span className="kpi-title">{title}</span>
      <div className={`kpi-icon ${iconClass}`}>{iconEl}</div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-sub">
      {badge && <span className={`kpi-badge ${badgeUp ? 'up' : 'down'}`}>{badge}</span>}
      {sub}
    </div>
  </div>
);

/* ── Equity sparkline ── */
var EquityChart = () => {
  var ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    var chart = LightweightCharts.createChart(ref.current, {
      layout: { background: { color: 'transparent' }, textColor: '#8b949e' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: true },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      width:  ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    });

    var series = chart.addSeries(LightweightCharts.AreaSeries, {
      lineColor: '#58a6ff',
      topColor: '#58a6ff33',
      bottomColor: '#58a6ff05',
      lineWidth: 2,
    });
    series.setData(EQUITY);
    chart.timeScale().fitContent();

    var ro = new ResizeObserver(() => {
      if (ref.current) {
        chart.applyOptions({ width: ref.current.offsetWidth, height: ref.current.offsetHeight });
      }
    });
    ro.observe(ref.current);

    return () => { chart.remove(); ro.disconnect(); };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

/* ── Market Overview ── */
var MarketOverview = () => (
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

/* ── Positions Table ── */
var PositionsTable = () => (
  <div className="card">
    <div className="section-label">オープンポジション</div>
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>銘柄</th>
            <th>サイド</th>
            <th>数量</th>
            <th>エントリー</th>
            <th>現在値</th>
            <th>損益 (USDT)</th>
          </tr>
        </thead>
        <tbody>
          {POSITIONS.map(p => (
            <tr key={p.symbol}>
              <td className="pos-symbol">{p.symbol}</td>
              <td><span className={`pos-side ${p.side}`}>{p.side.toUpperCase()}</span></td>
              <td>{p.size}</td>
              <td>{p.entry}</td>
              <td>{p.mark}</td>
              <td className={p.pnl.startsWith('+') ? 'up' : 'down'}>
                {p.pnl}
                <span style={{ color: '#8b949e', fontSize: 11, marginLeft: 4 }}>({p.pct}%)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ── Activity Feed ── */
var ActivityFeed = () => (
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

/* ── Alerts List ── */
var AlertsList = () => (
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

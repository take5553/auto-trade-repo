const { useRef, useEffect, useState } = React;

/* ── sample data generators ── */
function genCandles() {
  const data = [];
  let t = new Date('2024-01-02');
  let close = 42000;
  for (let i = 0; i < 120; i++) {
    const open = close;
    const change = (Math.random() - 0.48) * 800;
    close = Math.max(30000, open + change);
    const high = Math.max(open, close) + Math.random() * 300;
    const low  = Math.min(open, close) - Math.random() * 300;
    data.push({
      time: t.toISOString().slice(0, 10),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low:  +low.toFixed(2),
      close: +close.toFixed(2),
    });
    t.setDate(t.getDate() + 1);
  }
  return data;
}

function genVolume(candles) {
  return candles.map(c => ({
    time: c.time,
    value: +(Math.random() * 5000 + 500).toFixed(0),
    color: c.close >= c.open ? '#3fb95044' : '#f8514944',
  }));
}

const CANDLES = genCandles();
const VOLUMES = genVolume(CANDLES);
const LAST = CANDLES[CANDLES.length - 1];

const SYMBOLS = [
  { name: 'BTC/USDT', price: '43,250.10', change: '+2.34%', up: true },
  { name: 'ETH/USDT', price: '2,650.88',  change: '+1.12%', up: true },
  { name: 'SOL/USDT', price: '98.45',      change: '-0.87%', up: false },
  { name: 'BNB/USDT', price: '410.20',     change: '+0.55%', up: true },
  { name: 'XRP/USDT', price: '0.5812',     change: '-1.23%', up: false },
];

const ASK_ORDERS = [
  { price: '43,290', size: '0.842', total: '36,450' },
  { price: '43,280', size: '1.230', total: '53,134' },
  { price: '43,270', size: '0.558', total: '24,144' },
  { price: '43,265', size: '2.100', total: '90,856' },
  { price: '43,260', size: '0.320', total: '13,843' },
];
const BID_ORDERS = [
  { price: '43,250', size: '1.540', total: '66,605' },
  { price: '43,240', size: '0.770', total: '33,294' },
  { price: '43,230', size: '3.200', total: '138,336' },
  { price: '43,220', size: '0.430', total: '18,584' },
  { price: '43,210', size: '1.100', total: '47,531' },
];
const RECENT_TRADES = [
  { time: '14:32:05', price: '43,250', size: '0.124', up: true  },
  { time: '14:32:04', price: '43,248', size: '0.531', up: false },
  { time: '14:32:02', price: '43,252', size: '0.080', up: true  },
  { time: '14:32:01', price: '43,245', size: '1.200', up: false },
  { time: '14:31:59', price: '43,255', size: '0.340', up: true  },
  { time: '14:31:57', price: '43,260', size: '0.092', up: true  },
];

/* ── Chart component ── */
function MainChart() {
  const mainRef = useRef(null);
  const volRef  = useRef(null);
  const [tf, setTf] = useState('1D');

  useEffect(() => {
    const chartOpts = {
      layout: { background: { color: '#0d1117' }, textColor: '#8b949e' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: true },
      width:  mainRef.current.offsetWidth,
      height: mainRef.current.offsetHeight,
    };

    const chart = LightweightCharts.createChart(mainRef.current, chartOpts);
    const candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderUpColor: '#3fb950', borderDownColor: '#f85149',
      wickUpColor: '#3fb950', wickDownColor: '#f85149',
    });
    candleSeries.setData(CANDLES);

    const volChart = LightweightCharts.createChart(volRef.current, {
      layout: { background: { color: '#0d1117' }, textColor: '#8b949e' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: 'transparent' } },
      rightPriceScale: { borderColor: '#30363d', scaleMargins: { top: 0.1, bottom: 0 } },
      timeScale: { borderColor: '#30363d', visible: false },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      width:  volRef.current.offsetWidth,
      height: volRef.current.offsetHeight,
    });
    const volSeries = volChart.addSeries(LightweightCharts.HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volSeries.setData(VOLUMES);

    chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (range) volChart.timeScale().setVisibleLogicalRange(range);
    });

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: mainRef.current.offsetWidth, height: mainRef.current.offsetHeight });
      volChart.applyOptions({ width: volRef.current.offsetWidth, height: volRef.current.offsetHeight });
    });
    ro.observe(mainRef.current);

    return () => { chart.remove(); volChart.remove(); ro.disconnect(); };
  }, []);

  const tfs = ['15m', '1H', '4H', '1D', '1W'];

  return (
    <>
      <div className="chart-toolbar">
        <span className="chart-symbol">BTC/USDT</span>
        <span className="chart-price">{LAST.close.toLocaleString()}</span>
        <span className="chart-change-info up">+2.34%&nbsp;今日</span>
        <div className="tf-group">
          {tfs.map(t => (
            <button key={t} className={`tf-btn${tf === t ? ' active' : ''}`} onClick={() => setTf(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="chart-wrapper">
        <div id="main-chart" ref={mainRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="volume-bar-area">
        <div className="volume-label">VOLUME</div>
        <div id="volume-chart" ref={volRef} style={{ width: '100%', height: '80px' }} />
      </div>
    </>
  );
}

/* ── App ── */
function App() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dashboard">
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

      <div className="main">
        <aside className="sidebar">
          <div className="sidebar-title">ウォッチリスト</div>
          {SYMBOLS.map((s, i) => (
            <div key={s.name} className={`symbol-item${i === 0 ? ' active' : ''}`}>
              <div>
                <div className="symbol-name">{s.name}</div>
                <div className="symbol-price">{s.price}</div>
              </div>
              <div className={`symbol-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
            </div>
          ))}
        </aside>

        <section className="chart-area">
          <MainChart />
        </section>

        <aside className="right-panel">
          <div className="panel-section">
            <div className="panel-section-title">今日の損益</div>
            <div className="pnl-card">
              <div className="pnl-label">Realized P&L (USDT)</div>
              <div className="pnl-value">+1,284.50</div>
              <div className="pnl-sub">▲ 3.06% today</div>
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-section-title">マーケット統計</div>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">24H HIGH</div>
                <div className="stat-value up">44,120</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">24H LOW</div>
                <div className="stat-value down">42,010</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">24H VOL</div>
                <div className="stat-value">18.4K</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">FUNDING</div>
                <div className="stat-value up">0.012%</div>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-section-title">板情報</div>
            <div className="order-book">
              <div className="ob-row ob-header">
                <span>価格</span><span style={{ textAlign: 'right' }}>数量</span><span style={{ textAlign: 'right' }}>合計</span>
              </div>
              {ASK_ORDERS.map((o, i) => (
                <div key={i} className="ob-row ob-ask">
                  <div className="bar" style={{ width: `${20 + i * 15}%` }} />
                  <span className="ob-price-ask">{o.price}</span>
                  <span className="ob-size">{o.size}</span>
                  <span className="ob-total">{o.total}</span>
                </div>
              ))}
              <div className="ob-spread">スプレッド 10.00 (0.02%)</div>
              {BID_ORDERS.map((o, i) => (
                <div key={i} className="ob-row ob-bid">
                  <div className="bar" style={{ width: `${60 - i * 10}%` }} />
                  <span className="ob-price-bid">{o.price}</span>
                  <span className="ob-size">{o.size}</span>
                  <span className="ob-total">{o.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-section-title">最近の約定</div>
            <div className="trade-list">
              {RECENT_TRADES.map((t, i) => (
                <div key={i} className="trade-row">
                  <span className="trade-time">{t.time}</span>
                  <span className={t.up ? 'up' : 'down'}>{t.price}</span>
                  <span className="trade-size">{t.size}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

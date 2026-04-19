const { useRef, useEffect, useState } = React;

const fmtPrice  = v => v == null ? '—' : v.toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtChange = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1);
const fmtPct    = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%';

const SIGNAL_LABEL  = { buy: 'BUY', sell: 'SELL', neutral: 'NEUTRAL' };
const SIGNAL_COLOR  = { buy: '#3fb950', sell: '#f85149', neutral: '#8b949e' };
const SIGNAL_BG     = { buy: '#1a7f3722', sell: '#f8514922', neutral: '#21262d' };
const SIGNAL_BORDER = { buy: '#2ea04333', sell: '#f8514933', neutral: '#30363d' };

/* ── Chart ── */
function StockChart({ history, indicators, days, setDays }) {
  const mainRef = useRef(null);
  const volRef  = useRef(null);
  const rsiRef  = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!history || !indicators) return;
    const mainEl = mainRef.current;
    const volEl  = volRef.current;
    const rsiEl  = rsiRef.current;
    if (!mainEl || !volEl || !rsiEl) return;

    const baseOpts = {
      layout: { background: { color: '#0d1117' }, textColor: '#8b949e' },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: false },
    };

    // Main candlestick chart
    const chart = LightweightCharts.createChart(mainEl, {
      ...baseOpts,
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      width: mainEl.offsetWidth,
      height: mainEl.offsetHeight,
    });
    chartRef.current = chart;

    chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderUpColor: '#3fb950', borderDownColor: '#f85149',
      wickUpColor: '#3fb950', wickDownColor: '#f85149',
    }).setData(history.records.map(r => ({
      time: r.date, open: r.open, high: r.high, low: r.low, close: r.close,
    })));

    const ma5Data = indicators.ma5.filter(r => r.value != null).map(r => ({ time: r.date, value: r.value }));
    if (ma5Data.length) {
      chart.addSeries(LightweightCharts.LineSeries, {
        color: '#58a6ff', lineWidth: 1,
        priceLineVisible: false, lastValueVisible: false, title: 'MA5',
      }).setData(ma5Data);
    }

    const ma25Data = indicators.ma25.filter(r => r.value != null).map(r => ({ time: r.date, value: r.value }));
    if (ma25Data.length) {
      chart.addSeries(LightweightCharts.LineSeries, {
        color: '#d2a8ff', lineWidth: 1,
        priceLineVisible: false, lastValueVisible: false, title: 'MA25',
      }).setData(ma25Data);
    }

    // Volume chart
    const volChart = LightweightCharts.createChart(volEl, {
      ...baseOpts,
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: 'transparent' } },
      rightPriceScale: { borderColor: '#30363d', scaleMargins: { top: 0.1, bottom: 0 } },
      timeScale: { borderColor: '#30363d', visible: false },
      width: volEl.offsetWidth,
      height: volEl.offsetHeight,
    });
    volChart.addSeries(LightweightCharts.HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: '',
    }).setData(history.records.map(r => ({
      time: r.date, value: r.volume,
      color: r.close >= r.open ? '#3fb95044' : '#f8514944',
    })));

    // RSI chart
    const rsiChart = LightweightCharts.createChart(rsiEl, {
      ...baseOpts,
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      rightPriceScale: { borderColor: '#30363d', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: '#30363d', visible: false },
      width: rsiEl.offsetWidth,
      height: rsiEl.offsetHeight,
    });
    const rsiData = indicators.rsi14.filter(r => r.value != null).map(r => ({ time: r.date, value: r.value }));
    if (rsiData.length) {
      const rsiSeries = rsiChart.addSeries(LightweightCharts.LineSeries, {
        color: '#f0b429', lineWidth: 1.5,
        priceLineVisible: false, lastValueVisible: false,
      });
      rsiSeries.setData(rsiData);
      rsiSeries.createPriceLine({ price: 70, color: '#f8514966', lineWidth: 1, lineStyle: 2 });
      rsiSeries.createPriceLine({ price: 30, color: '#3fb95066', lineWidth: 1, lineStyle: 2 });
    }

    // Bidirectional time scale sync
    let syncing = false;
    const syncRange = (range, targets) => {
      if (syncing || !range) return;
      syncing = true;
      targets.forEach(t => t.timeScale().setVisibleLogicalRange(range));
      syncing = false;
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(r => syncRange(r, [volChart, rsiChart]));
    volChart.timeScale().subscribeVisibleLogicalRangeChange(r => syncRange(r, [chart, rsiChart]));
    rsiChart.timeScale().subscribeVisibleLogicalRangeChange(r => syncRange(r, [chart, volChart]));

    // Resize observer
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: mainEl.offsetWidth, height: mainEl.offsetHeight });
      volChart.applyOptions({ width: volEl.offsetWidth, height: volEl.offsetHeight });
      rsiChart.applyOptions({ width: rsiEl.offsetWidth, height: rsiEl.offsetHeight });
    });
    ro.observe(mainEl);
    ro.observe(volEl);
    ro.observe(rsiEl);

    const applyZoom = () => {
      if (!history || history.records.length === 0) return;
      const records = history.records;
      const lastDate = new Date(records[records.length - 1].date);
      const targetTime = lastDate.getTime() - (days * 24 * 60 * 60 * 1000);
      const visibleRecords = records.filter(r => new Date(r.date).getTime() >= targetTime);
      if (visibleRecords.length > 0) {
        chart.timeScale().setVisibleRange({
          from: visibleRecords[0].date,
          to: records[records.length - 1].date,
        });
      }
    };
    setTimeout(applyZoom, 0);

    return () => { chart.remove(); volChart.remove(); rsiChart.remove(); ro.disconnect(); chartRef.current = null; };
  }, [history, indicators]);

  useEffect(() => {
    if (!chartRef.current || !history || history.records.length === 0) return;
    const records = history.records;
    const lastDate = new Date(records[records.length - 1].date);
    const targetTime = lastDate.getTime() - (days * 24 * 60 * 60 * 1000);
    const visibleRecords = records.filter(r => new Date(r.date).getTime() >= targetTime);
    if (visibleRecords.length > 0) {
      chartRef.current.timeScale().setVisibleRange({
        from: visibleRecords[0].date,
        to: records[records.length - 1].date,
      });
    } else {
      chartRef.current.timeScale().fitContent();
    }
  }, [days, history]);

  return (
    <div className="chart-column">
      <div className="chart-toolbar">
        <div style={{ display: 'flex', gap: '14px' }}>
          <span><span style={{ color: '#58a6ff' }}>━</span>&nbsp;MA5</span>
          <span><span style={{ color: '#d2a8ff' }}>━</span>&nbsp;MA25</span>
          <span><span style={{ color: '#f0b429' }}>━</span>&nbsp;RSI(14)</span>
        </div>
        <div className="chart-period-selector" style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {[
            { label: '1ヶ月', days: 30 },
            { label: '3ヶ月', days: 90 },
            { label: '1年', days: 365 },
            { label: '3年', days: 1095 },
            { label: '5年', days: 1825 }
          ].map(p => (
            <button
              key={p.days}
              className={`period-btn ${days === p.days ? 'active' : ''}`}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={mainRef} className="main-chart-area" />
      <div className="vol-section">
        <span className="section-label">VOLUME</span>
        <div ref={volRef} className="vol-chart-area" />
      </div>
      <div className="rsi-section">
        <span className="section-label">RSI (14)</span>
        <div ref={rsiRef} className="rsi-chart-area" />
      </div>
    </div>
  );
}

const SCOPE_LABEL = {
  individual: '個別テクニカル',
  cross_sectional: 'クロスセクション',
  sector: 'セクター',
  market: '市場全体',
};

function getPrimaryDetail(pred) {
  return pred?.details?.find(d => d.scope === 'individual') || pred?.details?.[0] || null;
}

/* ── Signal Panel ── */
function SignalPanel({ prediction, indicators, lastClose }) {
  if (!prediction || !indicators) return null;

  const primary = getPrimaryDetail(prediction);
  const signal = primary?.signal ?? 'neutral';
  const confidence = primary?.confidence ?? 0;
  const reasons = primary?.reasons ?? [];
  const pct   = Math.round(confidence * 100);
  const color  = SIGNAL_COLOR[signal];

  const lastRsi  = indicators.rsi14.filter(r => r.value != null).slice(-1)[0]?.value;
  const lastMa5  = indicators.ma5.filter(r => r.value != null).slice(-1)[0]?.value;
  const lastMa25 = indicators.ma25.filter(r => r.value != null).slice(-1)[0]?.value;
  const { high_52w, low_52w } = indicators;

  const rangePct = (high_52w && low_52w && lastClose && high_52w !== low_52w)
    ? Math.max(0, Math.min(100, (lastClose - low_52w) / (high_52w - low_52w) * 100))
    : null;

  const rsiStatus = lastRsi == null ? null
    : lastRsi < 30 ? '売られすぎ圏（買いシグナル域）'
    : lastRsi > 70 ? '買われすぎ圏（売りシグナル域）'
    : '中立圏';
  const rsiClass = lastRsi == null ? 'neutral' : lastRsi < 30 ? 'up' : lastRsi > 70 ? 'down' : 'neutral';

  return (
    <div className="signal-column">

      {/* Signal */}
      <div className="signal-section">
        <div className="signal-section-title">売買シグナル</div>
        <span
          className="signal-badge-lg"
          style={{ background: SIGNAL_BG[signal], color, border: `1px solid ${SIGNAL_BORDER[signal]}` }}
        >
          {SIGNAL_LABEL[signal]}
        </span>
        <div className="pred-confidence-row">
          <span style={{ fontSize: 10, color: '#6e7681', flexShrink: 0 }}>信頼度</span>
          <div className="pred-confidence-bar-bg">
            <div className={`pred-confidence-bar ${signal}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`pred-confidence-value ${signal}`}>{pct}%</span>
        </div>
        <div className="pred-reasons" style={{ marginTop: 10 }}>
          {reasons.map((r, i) => <span key={i} className="pred-reason-tag">{r}</span>)}
        </div>
      </div>

      {/* RSI */}
      {lastRsi != null && (
        <div className="signal-section">
          <div className="signal-section-title">RSI (14日)</div>
          <div className="rsi-gauge">
            <span className={`rsi-value-lg ${rsiClass}`}>{lastRsi.toFixed(1)}</span>
            <div className="rsi-track">
              <div className="rsi-bar-bg">
                <div className="rsi-bar-fill" />
                <div className="rsi-bar-marker" style={{ left: `${lastRsi}%` }} />
              </div>
              <div className="rsi-scale">
                <span>0</span>
                <span style={{ color: '#3fb95099' }}>30</span>
                <span style={{ color: '#f8514999' }}>70</span>
                <span>100</span>
              </div>
            </div>
          </div>
          <div className="rsi-status">{rsiStatus}</div>
        </div>
      )}

      {/* Moving Averages */}
      {lastMa5 != null && lastMa25 != null && (
        <div className="signal-section">
          <div className="signal-section-title">移動平均線</div>
          <div className="ma-table">
            <div className="ma-row">
              <span className="ma-label">
                <span className="ma-dot" style={{ background: '#58a6ff' }} />5日MA
              </span>
              <span className="ma-value" style={{ color: '#58a6ff' }}>{fmtPrice(lastMa5)}</span>
            </div>
            <div className="ma-row">
              <span className="ma-label">
                <span className="ma-dot" style={{ background: '#d2a8ff' }} />25日MA
              </span>
              <span className="ma-value" style={{ color: '#d2a8ff' }}>{fmtPrice(lastMa25)}</span>
            </div>
            <div className="ma-row">
              <span className="ma-label">状態</span>
              <span className="ma-value" style={{ color: lastMa5 >= lastMa25 ? '#3fb950' : '#f85149', fontSize: 11 }}>
                {lastMa5 >= lastMa25 ? '▲ 5MA > 25MA（上昇）' : '▼ 5MA < 25MA（下降）'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 52-Week Range */}
      {rangePct != null && (
        <div className="signal-section">
          <div className="signal-section-title">52週レンジ</div>
          <div className="range-bar-bg">
            <div className="range-bar-marker" style={{ left: `${rangePct}%` }} />
          </div>
          <div className="range-labels">
            <span style={{ color: '#3fb950' }}>安 {fmtPrice(low_52w)}</span>
            <span style={{ color: '#e6edf3' }}>現 {fmtPrice(lastClose)}</span>
            <span style={{ color: '#f85149' }}>高 {fmtPrice(high_52w)}</span>
          </div>
          <div className="range-deviation">
            <span>
              高値比&nbsp;
              <span style={{ color: lastClose >= high_52w * 0.95 ? '#f85149' : '#6e7681' }}>
                {((lastClose - high_52w) / high_52w * 100).toFixed(1)}%
              </span>
            </span>
            <span>
              安値比&nbsp;
              <span style={{ color: lastClose <= low_52w * 1.1 ? '#3fb950' : '#6e7681' }}>
                +{((lastClose - low_52w) / low_52w * 100).toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Prediction Models */}
      {prediction.details && prediction.details.length > 0 && (
        <div className="signal-section">
          <div className="signal-section-title">予測モデル一覧</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            {prediction.details.map((d, i) => {
              const dpct = Math.round(d.confidence * 100);
              const dcolor = SIGNAL_COLOR[d.signal];
              return (
                <div key={i} style={{ background: '#161b22', borderRadius: 6, padding: '8px 10px', border: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#58a6ff', background: '#1f3f6e44', border: '1px solid #58a6ff33', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>
                      {SCOPE_LABEL[d.scope] ?? d.scope}
                    </span>
                    <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <span style={{ fontSize: 10, color: dcolor, fontWeight: 700, flexShrink: 0 }}>{SIGNAL_LABEL[d.signal]}</span>
                  </div>
                  {d.confidence > 0 && (
                    <div className="pred-confidence-row" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#6e7681', flexShrink: 0 }}>信頼度</span>
                      <div className="pred-confidence-bar-bg">
                        <div className={`pred-confidence-bar ${d.signal}`} style={{ width: `${dpct}%` }} />
                      </div>
                      <span className={`pred-confidence-value ${d.signal}`}>{dpct}%</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {d.reasons.map((r, j) => <span key={j} className="pred-reason-tag">{r}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

/* ── App ── */
function App() {
  const symbol = new URLSearchParams(window.location.search).get('symbol') || '';
  const [history,    setHistory]    = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [days,       setDays]       = useState(365);
  const [now,        setNow]        = useState(new Date());
  const [signalWidth, setSignalWidth] = useState(296);

  const handleResizeMouseDown = React.useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = signalWidth;
    const onMove = (mv) => {
      const delta = startX - mv.clientX;
      setSignalWidth(Math.max(220, Math.min(520, startWidth + delta)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [signalWidth]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!symbol) { setError('銘柄コードが指定されていません'); setLoading(false); return; }
    setLoading(true);
    const base = `/api/nikkei-core-50/stocks/${encodeURIComponent(symbol)}`;
    Promise.all([
      fetch(`${base}/history?days=1825`).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(`${base}/indicators?days=1825`).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(`${base}/prediction`).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
    ])
      .then(([h, ind, pred]) => { setHistory(h); setIndicators(ind); setPrediction(pred); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [symbol]);

  if (!symbol || loading || error) {
    const msg   = !symbol ? '銘柄コードが指定されていません' : loading ? '読み込み中...' : `エラー: ${error}`;
    const color = error ? '#f87171' : '#94a3b8';
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d1117', color }}>
        {msg}
      </div>
    );
  }

  const records   = history.records;
  const lastRec   = records.slice(-1)[0];
  const prevRec   = records.slice(-2)[0];
  const price     = lastRec?.close ?? null;
  const prevClose = prevRec?.close ?? null;
  const change    = price != null && prevClose != null ? price - prevClose : null;
  const changePct = change != null && prevClose ? change / prevClose * 100 : null;
  const updown    = change == null ? 'neutral' : change >= 0 ? 'up' : 'down';

  return (
    <div className="stock-app">
      <header className="header">
        <div className="header-logo" style={{ gap: 14 }}>
          <button className="back-btn" onClick={() => { window.location.href = '/nikkei-core-50/'; }}>
            ← 一覧
          </button>
          <span>📈 日経コア50</span>
        </div>
        <div className="header-right">
          <span className="badge live">● LIVE</span>
          <span className="badge">日経コア50</span>
          <span className="timestamp">{now.toLocaleTimeString('ja-JP')}</span>
        </div>
      </header>

      <div className="stock-info-bar">
        <div style={{ minWidth: 0, flexShrink: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.03em' }}>{symbol}</div>
          <div style={{ fontSize: 11, color: '#8b949e', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {history.name}
          </div>
        </div>
        <div className="info-divider" />
        <span className={`info-price ${updown}`}>{fmtPrice(price)}</span>
        <span className={`info-change ${updown}`}>{fmtChange(change)}&nbsp;({fmtPct(changePct)})</span>
        {prediction && (() => {
          const sig = getPrimaryDetail(prediction)?.signal ?? 'neutral';
          return (
            <>
              <div className="info-divider" />
              <span className={`pred-signal ${sig}`} style={{ fontSize: 12, padding: '3px 10px' }}>
                {SIGNAL_LABEL[sig]}
              </span>
            </>
          );
        })()}
      </div>

      <div className="stock-main" style={{ gridTemplateColumns: `minmax(0, 1fr) 16px ${signalWidth}px` }}>
        <StockChart history={history} indicators={indicators} days={days} setDays={setDays} />
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            width: '16px', cursor: 'col-resize', flexShrink: 0,
            background: '#1c2333',
            borderLeft: '1px solid #30363d', borderRight: '1px solid #30363d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <svg width="6" height="40" viewBox="0 0 6 40" style={{ pointerEvents: 'none', opacity: 0.6 }}>
            {[6, 12, 18, 24, 30, 34].map(y => (
              <circle key={y} cx="3" cy={y} r="1.5" fill="#8b949e" />
            ))}
          </svg>
        </div>
        <SignalPanel prediction={prediction} indicators={indicators} lastClose={price} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

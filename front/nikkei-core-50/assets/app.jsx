const { useState, useEffect, useMemo } = React;

const TABS = [
  { key: 'quotes',      label: '株価一覧' },
  { key: 'predictions', label: '売買シグナル' },
];

function buildSectorStats(quotes) {
  const map = {};
  for (const s of quotes) {
    if (!map[s.sector]) map[s.sector] = { advances: 0, declines: 0, unchanged: 0 };
    const st = map[s.sector];
    if (s.change_pct == null || s.change_pct === 0) st.unchanged++;
    else if (s.change_pct > 0) st.advances++;
    else st.declines++;
  }
  return map;
}

function buildSignalStats(predictions) {
  const map = {};
  for (const p of predictions) {
    if (!map[p.sector]) map[p.sector] = { buy: 0, sell: 0, neutral: 0 };
    map[p.sector][p.signal]++;
  }
  return map;
}

function RatioBar({ advances, declines, unchanged }) {
  const total = advances + declines + unchanged || 1;
  const upPct   = (advances / total) * 100;
  const downPct = (declines / total) * 100;
  return (
    <div className="ratio-bar-bg">
      <div style={{ width: `${upPct}%`,   height: '100%', background: '#3fb950', flexShrink: 0 }} />
      <div style={{ width: `${downPct}%`, height: '100%', background: '#f85149', flexShrink: 0 }} />
    </div>
  );
}

function SectorListRow({ label, st, sig, total, isActive, onClick }) {
  return (
    <button className={`slr ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="slr-check">{isActive ? '●' : '○'}</span>
      <span className="slr-name">{label}</span>
      <span className="slr-num">{total}銘柄</span>
      <span className="slr-stat up">▲{st.advances}</span>
      <span className="slr-stat down">▼{st.declines}</span>
      <span className="slr-stat neutral">―{st.unchanged}</span>
      <RatioBar advances={st.advances} declines={st.declines} unchanged={st.unchanged} />
      <span className="slr-sig buy">買{sig.buy}</span>
      <span className="slr-sig sell">売{sig.sell}</span>
      <span className="slr-sig neutral">中{sig.neutral}</span>
    </button>
  );
}

function SectorSummary({ summary, quotes, predictions, sectors, sectorStats, signalStats, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const allSt = useMemo(() => {
    const st = { advances: 0, declines: 0, unchanged: 0 };
    for (const s of Object.values(sectorStats)) {
      st.advances  += s.advances;
      st.declines  += s.declines;
      st.unchanged += s.unchanged;
    }
    return st;
  }, [sectorStats]);

  const allSig = useMemo(() => {
    const sig = { buy: 0, sell: 0, neutral: 0 };
    for (const p of predictions) sig[p.signal]++;
    return sig;
  }, [predictions]);

  const sectorTotals = useMemo(() => {
    const map = {};
    for (const q of quotes) map[q.sector] = (map[q.sector] || 0) + 1;
    return map;
  }, [quotes]);

  const curSt  = selected === null ? allSt  : (sectorStats[selected]  || { advances: 0, declines: 0, unchanged: 0 });
  const curSig = selected === null ? allSig : (signalStats[selected]  || { buy: 0, sell: 0, neutral: 0 });
  const curTotal = selected === null ? quotes.length : (sectorTotals[selected] || 0);
  const curLabel = selected === null ? 'すべて' : selected;

  return (
    <div className={`sector-summary ${open ? 'open' : ''}`}>
      <button className="ss-header" onClick={() => setOpen(o => !o)}>

        <span className="ss-label">{curLabel}</span>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">対象</span>
          <span className="summary-value" style={{ color: '#58a6ff' }}>{curTotal}銘柄</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">値上がり</span>
          <span className="summary-value up">▲ {curSt.advances}</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">値下がり</span>
          <span className="summary-value down">▼ {curSt.declines}</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">変わらず</span>
          <span className="summary-value neutral">― {curSt.unchanged}</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item ss-bar-item">
          <span className="summary-label">比率</span>
          <RatioBar advances={curSt.advances} declines={curSt.declines} unchanged={curSt.unchanged} />
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">買シグナル</span>
          <span className="summary-value" style={{ color: '#3fb950' }}>{curSig.buy}</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">売シグナル</span>
          <span className="summary-value" style={{ color: '#f85149' }}>{curSig.sell}</span>
        </div>
        <div className="summary-divider" />

        <div className="summary-item">
          <span className="summary-label">中立</span>
          <span className="summary-value neutral">{curSig.neutral}</span>
        </div>

        {summary && (
          <>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">基準日時</span>
              <span style={{ fontSize: 12, color: '#8b949e', fontVariantNumeric: 'tabular-nums' }}>{summary.as_of}</span>
            </div>
          </>
        )}

        <span className="ss-toggle">{open ? '▲' : '▼ セクター選択'}</span>
      </button>

      {open && (
        <div className="sector-list">
          <div className="slr-header">
            <span />
            <span className="slh">セクター</span>
            <span className="slh right">銘柄数</span>
            <span className="slh right" style={{ color: '#3fb95077' }}>値上</span>
            <span className="slh right" style={{ color: '#f8514977' }}>値下</span>
            <span className="slh right">変わらず</span>
            <span className="slh">比率</span>
            <span className="slh right" style={{ color: '#3fb95077' }}>買</span>
            <span className="slh right" style={{ color: '#f8514977' }}>売</span>
            <span className="slh right">中立</span>
          </div>
          <SectorListRow
            label="すべて"
            st={allSt} sig={allSig} total={quotes.length}
            isActive={selected === null}
            onClick={() => onSelect(null)}
          />
          {sectors.map(sec => (
            <SectorListRow
              key={sec} label={sec}
              st={sectorStats[sec]  || { advances: 0, declines: 0, unchanged: 0 }}
              sig={signalStats[sec] || { buy: 0, sell: 0, neutral: 0 }}
              total={sectorTotals[sec] || 0}
              isActive={selected === sec}
              onClick={() => onSelect(sec === selected ? null : sec)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState('quotes');
  const [sector, setSector] = useState(null);
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
      .then(([q, p, s]) => { setQuotes(q); setPredictions(p); setSummary(s); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const sectors     = useMemo(() => [...new Set(quotes.map(q => q.sector))].sort(), [quotes]);
  const sectorStats = useMemo(() => buildSectorStats(quotes),      [quotes]);
  const signalStats = useMemo(() => buildSignalStats(predictions), [predictions]);

  const filteredQuotes = useMemo(
    () => sector ? quotes.filter(q => q.sector === sector) : quotes,
    [quotes, sector]
  );
  const filteredPredictions = useMemo(
    () => sector ? predictions.filter(p => p.sector === sector) : predictions,
    [predictions, sector]
  );
  const sortedPredictions = useMemo(() => {
    const order = { buy: 0, sell: 1, neutral: 2 };
    return filteredPredictions.slice().sort(
      (a, b) => (order[a.signal] - order[b.signal]) || b.confidence - a.confidence
    );
  }, [filteredPredictions]);

  const buyCount  = filteredPredictions.filter(p => p.signal === 'buy').length;
  const sellCount = filteredPredictions.filter(p => p.signal === 'sell').length;

  if (loading) return (
    <div className="app" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#94a3b8' }}>
      読み込み中...
    </div>
  );
  if (error) return (
    <div className="app" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#f87171' }}>
      エラー: {error}
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">📈 日経コア50 ダッシュボード</div>
        <div className="header-right">
          <span className="badge live">● LIVE</span>
          <span className="badge">日経コア50</span>
          <span className="timestamp">{now.toLocaleTimeString('ja-JP')}</span>
        </div>
      </header>

      <div className="content">
        <SectorSummary
          summary={summary}
          quotes={quotes}
          predictions={predictions}
          sectors={sectors}
          sectorStats={sectorStats}
          signalStats={signalStats}
          selected={sector}
          onSelect={setSector}
        />

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
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e' }}>買 {buyCount} / 売 {sellCount}</span>
                )}
                {t.key === 'quotes' && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e' }}>{filteredQuotes.length}銘柄</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {tab === 'quotes' && (
              <div className="tile-grid">
                {filteredQuotes.map(stock => <StockCard key={stock.symbol} stock={stock} />)}
              </div>
            )}
            {tab === 'predictions' && (
              <div className="pred-tile-grid">
                {sortedPredictions.map(pred => <PredictionCard key={pred.symbol} pred={pred} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

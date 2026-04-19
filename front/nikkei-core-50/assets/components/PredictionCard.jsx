const SIGNAL_LABEL = { buy: 'BUY', sell: 'SELL', neutral: 'NEUTRAL' };

const PredictionCard = ({ pred }) => {
  const pct = Math.round(pred.confidence * 100);
  const handleClick = () => { window.location.href = `/nikkei-core-50/stock.html?symbol=${encodeURIComponent(pred.symbol)}`; };

  return (
    <div className={`pred-tile ${pred.signal}`} onClick={handleClick}>
      <div className="pred-tile-header">
        <div style={{ minWidth: 0 }}>
          <div className="tile-symbol">{pred.symbol}</div>
          <div className="tile-name" style={{ marginTop: 2 }}>{pred.name}</div>
        </div>
        <span className={`pred-signal ${pred.signal}`}>{SIGNAL_LABEL[pred.signal]}</span>
      </div>

      <span className="tile-sector" style={{ alignSelf: 'flex-start' }}>{pred.sector}</span>

      <div className="pred-confidence-row">
        <span style={{ fontSize: 10, color: '#6e7681', flexShrink: 0 }}>信頼度</span>
        <div className="pred-confidence-bar-bg">
          <div className={`pred-confidence-bar ${pred.signal}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`pred-confidence-value ${pred.signal}`}>{pct}%</span>
      </div>

      <div className="pred-reasons">
        {pred.reasons.map((r, i) => (
          <span key={i} className="pred-reason-tag">{r}</span>
        ))}
      </div>

      <DevLabel path="PredictionCard" />
    </div>
  );
};

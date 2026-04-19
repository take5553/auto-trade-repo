const SIGNAL_LABEL = { buy: 'BUY', sell: 'SELL', neutral: 'NEUTRAL' };

const PredictionCard = ({ pred }) => {
  const pct = Math.round(pred.confidence * 100);

  return (
    <div className={`pred-card ${pred.signal}`}>
      <div className="stock-left">
        <span className="stock-symbol">{pred.symbol}</span>
        <span className="stock-name">{pred.name}</span>
        <span className="stock-sector">{pred.sector}</span>
        <DevLabel path="components/PredictionCard.jsx" />
      </div>

      <span className={`pred-signal ${pred.signal}`}>{SIGNAL_LABEL[pred.signal]}</span>

      <div className="pred-confidence">
        <span className="pred-confidence-label">信頼度</span>
        <div className="pred-confidence-bar-bg">
          <div
            className={`pred-confidence-bar ${pred.signal}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`pred-confidence-value ${pred.signal}`}>{pct}%</span>
      </div>

      <div className="pred-reasons">
        {pred.reasons.map((r, i) => (
          <span key={i} className="pred-reason-tag">{r}</span>
        ))}
      </div>
    </div>
  );
};

const PositionCard = ({ pos }) => {
  const pnlUp = !pos.pnl.startsWith('-');

  return (
    <div className="pos-card">
      {/* Symbol + side */}
      <div className="pos-left">
        <span className="pos-symbol">{pos.symbol}</span>
        <div className="pos-meta">
          <span className={`pos-side ${pos.side}`}>{pos.side === 'long' ? 'LONG' : 'SHORT'}</span>
          <span className="pos-duration">{pos.duration}</span>
        </div>
        <DevLabel path="components/PositionCard.jsx" />
      </div>

      {/* Price info */}
      <div className="pos-prices">
        <div className="pos-price-row">
          <span className="pos-price-label">エントリー</span>
          <span className="pos-price-value">{pos.entry}</span>
        </div>
        <div className="pos-price-row">
          <span className="pos-price-label">現在値</span>
          <span className={`pos-price-value ${pnlUp ? 'up' : 'down'}`}>{pos.mark}</span>
        </div>
        <div className="pos-size">数量 {pos.size}</div>
      </div>

      {/* Sparkline */}
      <Sparkline data={pos.spark} up={pnlUp} />

      {/* PnL */}
      <div className="pos-pnl">
        <span className={`pos-pnl-value ${pnlUp ? 'up' : 'down'}`}>{pos.pnl}</span>
        <span className={`pos-pnl-pct ${pnlUp ? 'up' : 'down'}`}>
          {pnlUp ? '+' : ''}{pos.pct}%
        </span>
      </div>

      {/* Action */}
      <div className="pos-action">
        <button className="btn-close">決済</button>
      </div>
    </div>
  );
};

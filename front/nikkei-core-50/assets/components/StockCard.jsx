const StockCard = ({ stock }) => {
  const up = stock.change_pct != null && stock.change_pct >= 0;
  const changeClass = stock.change_pct == null ? 'neutral' : up ? 'up' : 'down';

  const fmtPrice = (v) => v == null ? '—' : v.toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtChange = (v) => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1);
  const fmtPct = (v) => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  const fmtVolume = (v) => v == null ? '—' : (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'M' : (v / 1_000).toFixed(0) + 'K');

  return (
    <div className="stock-card">
      <div className="stock-left">
        <span className="stock-symbol">{stock.symbol}</span>
        <span className="stock-name">{stock.name}</span>
        <span className="stock-sector">{stock.sector}</span>
        <DevLabel path="components/StockCard.jsx" />
      </div>

      <span className={`stock-price ${changeClass}`}>{fmtPrice(stock.price)}</span>

      <div className="stock-change">
        <span className={`stock-change-value ${changeClass}`}>{fmtChange(stock.change)}</span>
        <span className={`stock-change-pct ${changeClass}`}>{fmtPct(stock.change_pct)}</span>
      </div>

      <span className="stock-volume">{fmtVolume(stock.volume)}</span>

      <Sparkline data={stock.spark} up={up} />
    </div>
  );
};

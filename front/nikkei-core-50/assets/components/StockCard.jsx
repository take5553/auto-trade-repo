const StockCard = ({ stock }) => {
  const up = stock.change_pct != null && stock.change_pct >= 0;
  const changeClass = stock.change_pct == null ? 'neutral' : up ? 'up' : 'down';
  const tileClass   = stock.change_pct == null ? '' : up ? 'up-tile' : 'down-tile';
  const handleClick = () => { window.location.href = `/nikkei-core-50/stock.html?symbol=${encodeURIComponent(stock.symbol)}`; };

  const fmtPrice  = (v) => v == null ? '—' : v.toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtChange = (v) => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1);
  const fmtPct    = (v) => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  const fmtVolume = (v) => {
    if (v == null) return '—';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M株';
    return (v / 1_000).toFixed(0) + 'K株';
  };

  return (
    <div className={`stock-tile ${tileClass}`} onClick={handleClick}>
      <div className="tile-header">
        <span className="tile-symbol">{stock.symbol}</span>
        <span className="tile-sector">{stock.sector}</span>
      </div>

      <span className="tile-name">{stock.name}</span>

      <div className="tile-price-row">
        <span className={`tile-price ${changeClass}`}>{fmtPrice(stock.price)}</span>
        <span className={`tile-pct ${changeClass}`}>{fmtPct(stock.change_pct)}</span>
      </div>

      <div className="tile-meta-row">
        <span className={`tile-change ${changeClass}`}>{fmtChange(stock.change)}</span>
        <span className="tile-volume">{fmtVolume(stock.volume)}</span>
      </div>

      <Sparkline data={stock.spark} up={up} />

      <DevLabel path="StockCard" />
    </div>
  );
};

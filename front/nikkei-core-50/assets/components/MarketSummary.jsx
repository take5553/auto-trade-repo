const MarketSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="market-summary">
      <div className="summary-item">
        <span className="summary-label">対象</span>
        <span className="summary-value" style={{ color: '#58a6ff' }}>{summary.total_stocks}銘柄</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">値上がり</span>
        <span className="summary-value up">▲ {summary.advances}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">値下がり</span>
        <span className="summary-value down">▼ {summary.declines}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">変わらず</span>
        <span className="summary-value neutral">― {summary.unchanged}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">基準日時</span>
        <span style={{ fontSize: 12, color: '#8b949e', fontVariantNumeric: 'tabular-nums' }}>{summary.as_of}</span>
      </div>
    </div>
  );
};

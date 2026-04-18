const SummaryBar = ({ summary }) => {
  const pnlUp = !summary.totalPnl.startsWith('-');

  return (
    <div className="summary-bar">
      <div className="summary-item">
        <span className="summary-label">本日の含み損益</span>
        <span className={`summary-value ${pnlUp ? 'up' : 'down'}`}>{summary.totalPnl}</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-item">
        <span className="summary-label">損益率</span>
        <span className={`summary-value ${pnlUp ? 'up' : 'down'}`}>
          {pnlUp ? '+' : ''}{summary.totalPnlPct}%
        </span>
      </div>

      <div className="summary-divider" />

      <div className="summary-item">
        <span className="summary-label">オープンポジション</span>
        <span className="summary-value" style={{ color: '#58a6ff' }}>{summary.openPositions}</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-item">
        <span className="summary-label">勝率（直近30）</span>
        <span className="summary-value" style={{ color: '#d29900' }}>{summary.winRate}%</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-item">
        <span className="summary-label">残高</span>
        <span className="summary-value">{summary.equity}</span>
      </div>
    </div>
  );
};

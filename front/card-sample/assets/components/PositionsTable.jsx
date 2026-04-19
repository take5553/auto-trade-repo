const PositionsTable = () => (
  <div className="card">
    <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      オープンポジション
      <DevLabel path="components/PositionsTable.jsx" />
    </div>
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>銘柄</th>
            <th>サイド</th>
            <th>数量</th>
            <th>エントリー</th>
            <th>現在値</th>
            <th>損益 (USDT)</th>
          </tr>
        </thead>
        <tbody>
          {POSITIONS.map(p => (
            <tr key={p.symbol}>
              <td className="pos-symbol">{p.symbol}</td>
              <td><span className={`pos-side ${p.side}`}>{p.side.toUpperCase()}</span></td>
              <td>{p.size}</td>
              <td>{p.entry}</td>
              <td>{p.mark}</td>
              <td className={p.pnl.startsWith('+') ? 'up' : 'down'}>
                {p.pnl}
                <span style={{ color: '#8b949e', fontSize: 11, marginLeft: 4 }}>({p.pct}%)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

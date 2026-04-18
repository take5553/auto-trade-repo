/* ── Sample data ── */
function genEquityCurve() {
  var data = [];
  var t = new Date('2024-01-02');
  var value = 100000;
  for (var i = 0; i < 90; i++) {
    value += (Math.random() - 0.44) * 1200;
    value = Math.max(80000, value);
    data.push({ time: t.toISOString().slice(0, 10), value: +value.toFixed(2) });
    t.setDate(t.getDate() + 1);
  }
  return data;
}

var EQUITY        = genEquityCurve();
var LAST_EQUITY   = EQUITY[EQUITY.length - 1].value;
var FIRST_EQUITY  = EQUITY[0].value;
var EQUITY_CHANGE = ((LAST_EQUITY - FIRST_EQUITY) / FIRST_EQUITY * 100).toFixed(2);

var MARKETS = [
  { name: 'BTC/USDT', price: '43,250.10', change: '+2.34', up: true  },
  { name: 'ETH/USDT', price: '2,650.88',  change: '+1.12', up: true  },
  { name: 'SOL/USDT', price: '98.45',     change: '-0.87', up: false },
  { name: 'BNB/USDT', price: '410.20',    change: '+0.55', up: true  },
  { name: 'XRP/USDT', price: '0.5812',    change: '-1.23', up: false },
];

var POSITIONS = [
  { symbol: 'BTC/USDT', side: 'long',  size: '0.50',  entry: '42,100.00', mark: '43,250.10', pnl: '+575.05', pct: '+1.37' },
  { symbol: 'ETH/USDT', side: 'long',  size: '3.00',  entry: '2,580.00',  mark: '2,650.88',  pnl: '+212.64', pct: '+2.75' },
  { symbol: 'SOL/USDT', side: 'short', size: '10.00', entry: '101.20',    mark: '98.45',     pnl: '+27.50',  pct: '+2.72' },
  { symbol: 'BNB/USDT', side: 'long',  size: '2.00',  entry: '415.50',    mark: '410.20',    pnl: '-10.60',  pct: '-1.28' },
];

var FEED = [
  { type: 'buy',   text: 'BTC/USDT ロング 0.50 @ 42,100.00 で約定',      time: '14:32:05' },
  { type: 'sell',  text: 'SOL/USDT ショート 10.00 @ 101.20 で約定',       time: '14:20:41' },
  { type: 'alert', text: 'ETH/USDT RSI が 70 を超えました（過買い警告）', time: '13:55:12' },
  { type: 'buy',   text: 'ETH/USDT ロング 3.00 @ 2,580.00 で約定',        time: '13:40:08' },
  { type: 'sell',  text: 'XRP/USDT ショート決済 @ 0.5920 (+0.82%)',        time: '12:14:33' },
];

var ALERTS = [
  { level: 'danger', icon: '⚠', title: 'BTC ドローダウン警告',    desc: '最大ドローダウン 5% に近づいています' },
  { level: 'warn',   icon: '◎', title: 'SOL/USDT RSI 30 以下',    desc: '過売り圏に入りました' },
  { level: 'info',   icon: 'ℹ', title: 'ファンディングレート更新', desc: 'BTC 0.012% / ETH 0.008%' },
];

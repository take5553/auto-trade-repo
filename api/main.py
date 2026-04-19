import random
from fastapi import FastAPI

app = FastAPI()


@app.get("/api/hello")
def read_root():
    return {"message": "Hello from Python!"}


@app.get("/api/good_night")
def good_night():
    return {"message": "Good night from Python!"}


def gen_sparkline(base_price: float, points: int, volatility: float) -> list[float]:
    data = []
    v = base_price
    for _ in range(points):
        v += (random.random() - 0.48) * volatility
        v = max(base_price * 0.85, v)
        data.append(round(v, 2))
    return data


@app.get("/api/card-list/positions")
def get_positions():
    return [
        {
            "id": 1,
            "symbol": "BTC/USDT",
            "side": "long",
            "size": "0.50",
            "entry": "42,100.00",
            "mark": "43,250.10",
            "pnl": "+$575.05",
            "pct": "1.37",
            "duration": "2h 14m",
            "spark": gen_sparkline(42100, 30, 400),
        },
        {
            "id": 2,
            "symbol": "ETH/USDT",
            "side": "long",
            "size": "3.00",
            "entry": "2,580.00",
            "mark": "2,650.88",
            "pnl": "+$212.64",
            "pct": "2.75",
            "duration": "4h 52m",
            "spark": gen_sparkline(2580, 30, 40),
        },
        {
            "id": 3,
            "symbol": "SOL/USDT",
            "side": "short",
            "size": "10.00",
            "entry": "101.20",
            "mark": "98.45",
            "pnl": "+$27.50",
            "pct": "2.72",
            "duration": "1h 08m",
            "spark": gen_sparkline(101, 30, 2),
        },
        {
            "id": 4,
            "symbol": "BNB/USDT",
            "side": "long",
            "size": "2.00",
            "entry": "415.50",
            "mark": "410.20",
            "pnl": "-$10.60",
            "pct": "-1.28",
            "duration": "6h 33m",
            "spark": gen_sparkline(415, 30, 5),
        },
        {
            "id": 5,
            "symbol": "XRP/USDT",
            "side": "short",
            "size": "1000.00",
            "entry": "0.5920",
            "mark": "0.5812",
            "pnl": "+$10.80",
            "pct": "1.82",
            "duration": "0h 41m",
            "spark": gen_sparkline(0.592, 30, 0.005),
        },
        {
            "id": 6,
            "symbol": "MATIC/USDT",
            "side": "long",
            "size": "500.00",
            "entry": "0.8810",
            "mark": "0.9120",
            "pnl": "+$15.50",
            "pct": "3.52",
            "duration": "3h 20m",
            "spark": gen_sparkline(0.881, 30, 0.008),
        },
        {
            "id": 7,
            "symbol": "DOGE/USDT",
            "side": "short",
            "size": "2000.00",
            "entry": "0.1045",
            "mark": "0.1088",
            "pnl": "-$8.60",
            "pct": "-4.11",
            "duration": "5h 05m",
            "spark": gen_sparkline(0.1045, 30, 0.001),
        },
    ]


@app.get("/api/card-list/alerts")
def get_alerts():
    return [
        {"level": "danger", "icon": "⚠", "title": "BTC ドローダウン警告",    "desc": "最大ドローダウン 5% に近づいています",       "time": "14:35"},
        {"level": "warn",   "icon": "◎", "title": "SOL/USDT RSI 30 以下",    "desc": "過売り圏に入りました",                      "time": "14:28"},
        {"level": "info",   "icon": "ℹ", "title": "ファンディングレート更新", "desc": "BTC 0.012% / ETH 0.008%",                  "time": "14:00"},
        {"level": "warn",   "icon": "◎", "title": "DOGE/USDT 急騰",          "desc": "過去 15 分で +4.1%。ストップ確認を推奨",   "time": "13:52"},
    ]


@app.get("/api/card-list/summary")
def get_summary():
    return {
        "totalPnl": "+$832.29",
        "totalPnlPct": "1.94",
        "openPositions": 7,
        "winRate": "68.4",
        "equity": "$43,950.80",
    }

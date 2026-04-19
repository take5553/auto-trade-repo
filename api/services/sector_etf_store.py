from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf


SECTOR_ETF_INFO: dict[str, dict[str, str]] = {
    "1617.T": {"name": "NF・食品",                 "sector": "食品"},
    "1618.T": {"name": "NF・エネルギー資源",       "sector": "エネルギー資源"},
    "1619.T": {"name": "NF・建設・資材",           "sector": "建設・資材"},
    "1620.T": {"name": "NF・素材・化学",           "sector": "素材・化学"},
    "1621.T": {"name": "NF・医薬品",               "sector": "医薬品"},
    "1622.T": {"name": "NF・自動車・輸送機",       "sector": "自動車・輸送機"},
    "1623.T": {"name": "NF・鉄鋼・非鉄",           "sector": "鉄鋼・非鉄"},
    "1624.T": {"name": "NF・機械",                 "sector": "機械"},
    "1625.T": {"name": "NF・電機・精密",           "sector": "電機・精密"},
    "1626.T": {"name": "NF・情報通信・サービス他", "sector": "情報通信・サービスその他"},
    "1627.T": {"name": "NF・電気・ガス",           "sector": "電気・ガス"},
    "1628.T": {"name": "NF・運輸・物流",           "sector": "運輸・物流"},
    "1629.T": {"name": "NF・商社・卸売",           "sector": "商社・卸売"},
    "1630.T": {"name": "NF・小売",                 "sector": "小売"},
    "1631.T": {"name": "NF・銀行",                 "sector": "銀行"},
    "1632.T": {"name": "NF・金融（除く銀行）",     "sector": "金融（除く銀行）"},
    "1633.T": {"name": "NF・不動産",               "sector": "不動産"},
}

# TICKER_INFO の sector 名 → ETF ティッカー
SECTOR_TO_ETF: dict[str, str] = {
    info["sector"]: ticker for ticker, info in SECTOR_ETF_INFO.items()
}

ALL_ETF_SYMBOLS: list[str] = list(SECTOR_ETF_INFO.keys())

DATA_DIR = Path(__file__).parent.parent / "stock_data" / "sector_etf"


class SectorEtfStore:
    """
    セクターETF（NF・TOPIX-17）の OHLCV データを管理する。
    NikkeiDataStore と同じ初回5年・差分更新方式。
    """

    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._checked_today: bool = False

    def ensure_all(self) -> None:
        if self._checked_today:
            return

        today = date.today()
        missing = [s for s in ALL_ETF_SYMBOLS if not (DATA_DIR / f"{s}.csv").exists()]
        existing = [s for s in ALL_ETF_SYMBOLS if s not in missing]

        if missing:
            print(f"[SectorEtfStore] 初回取得: {len(missing)} ETFの5年分データをダウンロード中...")
            self._batch_download(missing, period="5y")

        if existing:
            sample_df = self._load_csv(existing[0])
            latest: date = sample_df.index[-1].date()  # type: ignore[union-attr]
            if latest < today:
                from_date = latest + timedelta(days=1)
                print(f"[SectorEtfStore] 差分取得: {from_date} 〜 今日 ({len(existing)} ETF)")
                self._batch_download(existing, start=from_date.isoformat())

        self._checked_today = True

    def get_ohlcv(self, symbol: str) -> pd.DataFrame:
        return self._load_csv(symbol)

    def get_etf_ticker(self, sector: str) -> str | None:
        return SECTOR_TO_ETF.get(sector)

    def _batch_download(self, symbols: list[str], **kwargs: object) -> None:
        raw = yf.download(
            symbols,
            group_by="ticker",
            auto_adjust=True,
            progress=False,
            **kwargs,  # type: ignore[arg-type]
        )

        for symbol in symbols:
            try:
                if isinstance(raw.columns, pd.MultiIndex):
                    df = raw[symbol][["Open", "High", "Low", "Close", "Volume"]].copy()
                else:
                    df = raw[["Open", "High", "Low", "Close", "Volume"]].copy()

                df = df.dropna(how="all")
                df.index = pd.to_datetime(df.index).tz_localize(None)

                csv_path = DATA_DIR / f"{symbol}.csv"
                if csv_path.exists():
                    existing_df = self._load_csv(symbol)
                    df = pd.concat([existing_df, df])
                    df = df[~df.index.duplicated(keep="last")]
                    df.sort_index(inplace=True)

                df.to_csv(csv_path, index_label="Date")
            except Exception as e:
                print(f"[SectorEtfStore] {symbol} の保存に失敗: {e}")

    def _load_csv(self, symbol: str) -> pd.DataFrame:
        path = DATA_DIR / f"{symbol}.csv"
        df = pd.read_csv(path, index_col="Date", parse_dates=True)
        df.index = pd.to_datetime(df.index).tz_localize(None)
        return df

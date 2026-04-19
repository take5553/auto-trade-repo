from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf


TICKER_INFO: dict[str, dict[str, str]] = {
    # 1. 食品 (3)
    "2502.T": {"name": "アサヒグループHD",        "sector": "食品"},
    "2802.T": {"name": "味の素",                  "sector": "食品"},
    "2914.T": {"name": "日本たばこ産業",          "sector": "食品"},
    
    # 2. エネルギー資源 (3)
    "1605.T": {"name": "INPEX",                   "sector": "エネルギー資源"},
    "5019.T": {"name": "出光興産",                "sector": "エネルギー資源"},
    "5020.T": {"name": "ENEOSホールディングス",   "sector": "エネルギー資源"},
    
    # 3. 建設・資材 (3)
    "1801.T": {"name": "大成建設",                "sector": "建設・資材"},
    "1802.T": {"name": "大林組",                  "sector": "建設・資材"},
    "1925.T": {"name": "大和ハウス工業",          "sector": "建設・資材"},
    
    # 4. 素材・化学 (4)
    "3402.T": {"name": "東レ",                    "sector": "素材・化学"},
    "4063.T": {"name": "信越化学工業",            "sector": "素材・化学"},
    "4188.T": {"name": "三菱ケミカルグループ",    "sector": "素材・化学"},
    "4452.T": {"name": "花王",                    "sector": "素材・化学"},
    
    # 5. 医薬品 (4)
    "4502.T": {"name": "武田薬品工業",            "sector": "医薬品"},
    "4503.T": {"name": "アステラス製薬",          "sector": "医薬品"},
    "4519.T": {"name": "中外製薬",                "sector": "医薬品"},
    "4568.T": {"name": "第一三共",                "sector": "医薬品"},
    
    # 6. 自動車・輸送機 (4)
    "7201.T": {"name": "日産自動車",              "sector": "自動車・輸送機"},
    "7203.T": {"name": "トヨタ自動車",            "sector": "自動車・輸送機"},
    "7267.T": {"name": "本田技研工業",            "sector": "自動車・輸送機"},
    "7269.T": {"name": "スズキ",                  "sector": "自動車・輸送機"},
    
    # 7. 鉄鋼・非鉄 (3)
    "5401.T": {"name": "日本製鉄",                "sector": "鉄鋼・非鉄"},
    "5411.T": {"name": "JFEホールディングス",     "sector": "鉄鋼・非鉄"},
    "5713.T": {"name": "住友金属鉱山",            "sector": "鉄鋼・非鉄"},
    
    # 8. 機械 (4)
    "6301.T": {"name": "コマツ",                  "sector": "機械"},
    "6367.T": {"name": "ダイキン工業",            "sector": "機械"},
    "6506.T": {"name": "安川電機",                "sector": "機械"},
    "7011.T": {"name": "三菱重工業",              "sector": "機械"},
    
    # 9. 電機・精密 (8)
    "6501.T": {"name": "日立製作所",              "sector": "電機・精密"},
    "6752.T": {"name": "パナソニックHD",          "sector": "電機・精密"},
    "6758.T": {"name": "ソニーグループ",          "sector": "電機・精密"},
    "6902.T": {"name": "デンソー",                "sector": "電機・精密"},
    "6954.T": {"name": "ファナック",              "sector": "電機・精密"},
    "6971.T": {"name": "京セラ",                  "sector": "電機・精密"},
    "7733.T": {"name": "オリンパス",              "sector": "電機・精密"},
    "8035.T": {"name": "東京エレクトロン",        "sector": "電機・精密"},
    
    # 10. 情報通信・サービスその他 (7)
    "4324.T": {"name": "電通グループ",            "sector": "情報通信・サービスその他"},
    "4689.T": {"name": "LINEヤフー",              "sector": "情報通信・サービスその他"},
    "4755.T": {"name": "楽天グループ",            "sector": "情報通信・サービスその他"},
    "9432.T": {"name": "日本電信電話",            "sector": "情報通信・サービスその他"},
    "9433.T": {"name": "KDDI",                    "sector": "情報通信・サービスその他"},
    "9434.T": {"name": "ソフトバンク",            "sector": "情報通信・サービスその他"},
    "9984.T": {"name": "ソフトバンクグループ",    "sector": "情報通信・サービスその他"},
    
    # 11. 電気・ガス (3)
    "9502.T": {"name": "中部電力",                "sector": "電気・ガス"},
    "9503.T": {"name": "関西電力",                "sector": "電気・ガス"},
    "9531.T": {"name": "東京ガス",                "sector": "電気・ガス"},
    
    # 12. 運輸・物流 (4)
    "9020.T": {"name": "東日本旅客鉄道",          "sector": "運輸・物流"},
    "9022.T": {"name": "東海旅客鉄道",            "sector": "運輸・物流"},
    "9064.T": {"name": "ヤマトHD",                "sector": "運輸・物流"},
    "9104.T": {"name": "商船三井",                "sector": "運輸・物流"},
    
    # 13. 商社・卸売 (4)
    "8001.T": {"name": "伊藤忠商事",              "sector": "商社・卸売"},
    "8031.T": {"name": "三井物産",                "sector": "商社・卸売"},
    "8053.T": {"name": "住友商事",                "sector": "商社・卸売"},
    "8058.T": {"name": "三菱商事",                "sector": "商社・卸売"},
    
    # 14. 小売 (3)
    "3382.T": {"name": "セブン&アイHD",           "sector": "小売"},
    "8233.T": {"name": "高島屋",                  "sector": "小売"},
    "9983.T": {"name": "ファーストリテイリング",  "sector": "小売"},
    
    # 15. 銀行 (3)
    "8306.T": {"name": "三菱UFJフィナンシャルG",  "sector": "銀行"},
    "8316.T": {"name": "三井住友フィナンシャルG", "sector": "銀行"},
    "8411.T": {"name": "みずほフィナンシャルG",   "sector": "銀行"},
    
    # 16. 金融（除く銀行） (3)
    "8604.T": {"name": "野村HD",                  "sector": "金融（除く銀行）"},
    "8725.T": {"name": "MS&ADインシュアランス",   "sector": "金融（除く銀行）"},
    "8766.T": {"name": "東京海上HD",              "sector": "金融（除く銀行）"},
    
    # 17. 不動産 (3)
    "8801.T": {"name": "三井不動産",              "sector": "不動産"},
    "8802.T": {"name": "三菱地所",                "sector": "不動産"},
    "8830.T": {"name": "住友不動産",              "sector": "不動産"}
}

ALL_SYMBOLS: list[str] = list(TICKER_INFO.keys())

DATA_DIR = Path(__file__).parent.parent / "stock_data" / "nikkei_core_50"


class NikkeiDataStore:
    """
    CSV ファイルへの読み書きと yfinance からの取得を担う。
    初回: 5年分を一括ダウンロード → 銘柄ごとに保存。
    2回目以降: 最終日の翌日〜今日を差分取得して追記。
    同日内の2回目以降のアクセスはファイルをそのまま返す。
    """

    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._checked_today: bool = False

    def ensure_all(self) -> None:
        """全銘柄のデータが最新か確認し、必要なら取得・更新する。"""
        today = date.today()

        # 同日内は1回だけチェック
        if self._checked_today:
            return

        missing = [s for s in ALL_SYMBOLS if not (DATA_DIR / f"{s}.csv").exists()]
        existing = [s for s in ALL_SYMBOLS if s not in missing]

        if missing:
            print(f"[DataStore] 初回取得: {len(missing)} 銘柄の5年分データをダウンロード中...")
            self._batch_download(missing, period="5y")

        if existing:
            sample_df = self._load_csv(existing[0])
            latest: date = sample_df.index[-1].date()  # type: ignore[union-attr]
            if latest < today:
                from_date = latest + timedelta(days=1)
                print(f"[DataStore] 差分取得: {from_date} 〜 今日 ({len(existing)} 銘柄)")
                self._batch_download(existing, start=from_date.isoformat())

        self._checked_today = True

    def get_ohlcv(self, symbol: str) -> pd.DataFrame:
        """指定銘柄の OHLCV DataFrame を返す（ensure_all 呼び出し後を前提）。"""
        return self._load_csv(symbol)

    # ------------------------------------------------------------------
    # private
    # ------------------------------------------------------------------

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
                print(f"[DataStore] {symbol} の保存に失敗: {e}")

    def _load_csv(self, symbol: str) -> pd.DataFrame:
        path = DATA_DIR / f"{symbol}.csv"
        df = pd.read_csv(path, index_col="Date", parse_dates=True)
        df.index = pd.to_datetime(df.index).tz_localize(None)
        return df

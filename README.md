# 自動売買でがっぽがっぽ

自動売買システムのダッシュボード開発リポジトリ。
（ただし、PoCであり実際は売買指示のみで自動売買はしない）

FastAPI バックエンド + Nginx + React フロントエンドで構成。

## 構成

```
auto-trade-repo/
├── api/                      # Python (FastAPI) バックエンド
│   ├── main.py               # FastAPI エントリポイント
│   ├── routers/              # HTTP 層（APIRouter ごとに 1 ファイル）
│   ├── services/             # ビジネスロジック層（ABC + 実装）
│   │   ├── sector_etf_store.py   # TOPIX-17セクターETFデータ管理
│   │   └── predictions/      # 予測ロジック（Strategyパターン、スコープ別）
│   ├── schemas/              # Pydantic モデル（APIコントラクト）
│   └── stock_data/           # yfinance でダウンロードした株価 CSV
├── front/                    # フロントエンド (HTML + React)
│   ├── index.html            # トップページ
│   ├── nikkei-core-50/       # 日経コア50ダッシュボード（タイル型グリッド）
│   │   ├── index.html        # 銘柄一覧
│   │   └── stock.html        # 銘柄詳細（チャート・予測）
│   ├── card-sample/          # カードダッシュボード（横長カード縦並び）
│   ├── card-list-sample/     # カードリストダッシュボード（情報密度改善版）
│   └── chart-sample/         # チャートサンプル
└── infra/
    └── docker/
        ├── nginx/    # Nginx 設定・Dockerfile
        └── python/   # Python 用 Dockerfile
```

## ローカルでの開発

### 起動

```bash
docker compose up -d
```

### アクセス先

| URL | 説明 |
|-----|------|
| `http://localhost/` | フロントエンド（HTML） |
| `http://localhost/nikkei-core-50/` | 日経コア50ダッシュボード |
| `http://localhost/card-sample/` | カードダッシュボード（サンプル） |
| `http://localhost/card-list-sample/` | カードリストダッシュボード（サンプル） |
| `http://localhost/api/*` | FastAPI バックエンド |
| `http://localhost:8080/api/*` | FastAPI 直接アクセス（開発用） |
| `http://localhost:8080/docs` | OpenAPI ドキュメント（API 仕様の正本） |

### ルーティング

- `/api/*` → FastAPI コンテナ (port 8080) へ Nginx がプロキシ
- それ以外 → `front/` 以下の静的 HTML ファイルを返却

## API エンドポイント

| メソッド | パス | 説明 |
|--------|------|------|
| GET | `/api/hello` | `Hello from Python!` を返す |
| GET | `/api/good_night` | `Good night from Python!` を返す |
| GET | `/api/card-list/positions` | カードリスト用：保有ポジション一覧 |
| GET | `/api/card-list/alerts` | カードリスト用：アラート一覧 |
| GET | `/api/card-list/summary` | カードリスト用：ダッシュボードのサマリ |
| GET | `/api/nikkei-core-50/quotes` | 日経コア50：全銘柄の現在値一覧 |
| GET | `/api/nikkei-core-50/summary` | 日経コア50：マーケットサマリー |
| GET | `/api/nikkei-core-50/predictions` | 日経コア50：全銘柄の予測一覧 |
| GET | `/api/nikkei-core-50/stocks/{symbol}/history` | 日経コア50：銘柄の価格履歴 |
| GET | `/api/nikkei-core-50/stocks/{symbol}/indicators` | 日経コア50：銘柄のテクニカル指標（MA・RSI・52週高安値） |
| GET | `/api/nikkei-core-50/stocks/{symbol}/prediction` | 日経コア50：銘柄の予測（individual / sector / cross_sectional / market） |

詳細なレスポンススキーマは `http://localhost:8080/docs` を参照。

## 銘柄詳細ページ（stock.html）の主な機能

| 機能 | 概要 |
|------|------|
| ローソク足チャート | MA5・MA25 オーバーレイ、出来高・RSI(14) サブチャート。期間切替（1ヶ月〜5年） |
| 売買シグナル | 予測モデル一覧を表示。スコープ（個別テクニカル / セクター相対強度 / クロスセクション / 市場全体）ごとにシグナル・信頼度・根拠タグを表示 |
| セクター相対強度 | 銘柄終値 ÷ TOPIX-17セクターETF終値のレシオチャートを分析。MA クロス・モメンタム・Zスコアから売買シグナルを生成 |
| ドラッグリサイズ | チャートと指標パネルの境界をドラッグして幅を調整可能。デフォルト比率は 68:32、最大 70% まで拡張可能 |

## 開発方針

- **バックエンド先行**：新しいページは `api/schemas/` でAPIコントラクトを確定させてから `services/` と `routers/` を実装し、フロントはそれに合わせて作る。
- 新ページ追加時のバックエンド側のフォルダ構成ルールは [`AGENTS.md`](./AGENTS.md) を参照。

## 技術スタック

- **バックエンド**: Python 3.14 / FastAPI / Uvicorn / Pydantic / yfinance
- **フロントエンド**: React 18 (CDN) / Babel Standalone / CSS
- **インフラ**: Docker Compose / Nginx

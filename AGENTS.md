# AGENTS.md

自動売買システムのダッシュボード PoC。売買指示のみで自動執行はしない。

## 構成

```
auto-trade-repo/
├── api/                      # Python (FastAPI) バックエンド
│   ├── main.py               # FastAPI エントリポイント（include_router を列挙）
│   ├── routers/              # HTTP 層（APIRouter ごとに 1 ファイル）
│   ├── services/             # ビジネスロジック層（ABC + 実装）
│   │   └── predictions/      # 予測ロジック（Strategyパターン、スコープ別モジュール）
│   │       ├── base.py       # 基底クラス
│   │       ├── engine.py     # 予測エンジン（各Strategyを統括）
│   │       ├── market.py     # マーケット全体レベルの予測
│   │       ├── sector.py     # セクターレベルの予測（TOPIX-17粒度）
│   │       ├── cross_sectional.py  # クロスセクショナル予測
│   │       └── individual.py # 個別銘柄レベルの予測
│   ├── schemas/              # Pydantic モデル（APIコントラクト）
│   └── stock_data/           # yfinance でダウンロードした株価 CSV（git 管理外）
├── front/                    # 静的フロントエンド (HTML + React CDN)
│   ├── index.html
│   ├── nikkei-core-50/       # 日経コア50ダッシュボード（タイル型グリッド）
│   │   ├── index.html        # 銘柄一覧ダッシュボード
│   │   └── stock.html        # 銘柄詳細ページ（チャート・予測）
│   ├── card-sample/          # カードダッシュボード（横長カード縦並び）
│   ├── card-list-sample/     # カードリストダッシュボード（情報密度改善版）
│   └── chart-sample/         # チャートサンプル
└── infra/
    └── docker/
        ├── nginx/    # Nginx 設定・Dockerfile
        └── python/   # Python 用 Dockerfile
```

## 起動

```bash
docker compose up -d
```

- `http://localhost/api/*` → FastAPI (port 8080)
- それ以外 → `front/` の静的ファイル

## 技術スタック

- Python 3.14 / FastAPI / Uvicorn / Pydantic / yfinance
- React 18 (CDN) / Babel Standalone
- Docker Compose / Nginx

## 開発方針

- **バックエンド先行**：新しいページは `schemas/` でAPIコントラクトを先に確定してから `services/` と `routers/` を実装し、その後フロントに着手する。
- **API仕様の正本は `/docs`**：FastAPI 自動生成の OpenAPI を参照する。

## バックエンドのコード構成ルール

新しいページ（機能）を追加するときは、下記のファイルをセットで追加する。

| ファイル | 役割 |
|---------|------|
| `api/schemas/<page>.py` | Pydantic モデル（リクエスト／レスポンスの型）。1ページに複数モデルがあってもこの1ファイルに集約。 |
| `api/services/<page>.py` | ビジネスロジックの ABC。戻り値の型は `schemas/` を参照。 |
| `api/services/<page>_mock.py` | モック実装。`_mock` サフィックスで固定。 |
| `api/services/<page>_<datasource>.py` | 実データ実装。データソース名をサフィックスに付ける（例：`_yfinance`）。 |
| `api/routers/<page>.py` | `APIRouter(prefix="/api/<page-kebab>")`。薄く保ち、service を呼ぶだけ。各エンドポイントに `response_model=...` を付ける。 |

補助ファイル（必要に応じて追加）：

| ファイル | 役割 |
|---------|------|
| `api/services/<page>_store.py` | 銘柄リストや静的マスターデータの管理。 |
| `api/services/predictions/` | 予測ロジックをStrategyパターンで実装するサブパッケージ。スコープ（market / sector / cross_sectional / individual）ごとにモジュールを分割し `engine.py` が統括する。 |
| `api/stock_data/<page>/` | yfinance 等でダウンロードした CSV。git 管理外（`.gitignore` で除外）。 |

命名規則：
- URL は kebab-case（例：`/api/nikkei-core-50`）
- Python モジュール／ファイル名は snake_case（例：`nikkei_core_50`）

追加後は `api/main.py` の `include_router` に登録する。

## 作業ルール

- 作業開始時はブランチを切ること。ただし、mainブランチから既にブランチが切られていたら明確な指示が無い限り切る必要はない。

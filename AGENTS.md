# AGENTS.md

自動売買システムのダッシュボード PoC。売買指示のみで自動執行はしない。

## 構成

```
auto-trade-repo/
├── api/              # Python (FastAPI) バックエンド
├── front/            # 静的フロントエンド (HTML + React CDN)
│   ├── index.html
│   ├── card-sample/          # カードダッシュボード（横長カード縦並び）
│   └── card-list-sample/     # カードリストダッシュボード（情報密度改善版）
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

- Python 3.14 / FastAPI / Uvicorn
- React 18 (CDN) / Babel Standalone
- Docker Compose / Nginx

## 作業ルール

- 作業開始時は必ずブランチを切ること
- 一つの作業が完了したらコミットすること
- コミットの実行前には必ずユーザーに許可を求めること

# 自動売買でがっぽがっぽ

自動売買システムのダッシュボード開発リポジトリ。
（ただし、PoCであり実際は売買指示のみで自動売買はしない）

FastAPI バックエンド + Nginx + React フロントエンドで構成。

## 構成

```
auto-trade-repo/
├── api/              # Python (FastAPI) バックエンド
├── front/            # フロントエンド (HTML + React)
│   ├── index.html            # トップページ
│   ├── card-sample/          # カードダッシュボード（横長カード縦並び）
│   └── card-list-sample/     # カードリストダッシュボード（情報密度改善版）
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
| `http://localhost/card-sample/` | カードダッシュボード（サンプル） |
| `http://localhost/card-list-sample/` | カードリストダッシュボード（サンプル） |
| `http://localhost/api/*` | FastAPI バックエンド |
| `http://localhost:8080/api/*` | FastAPI 直接アクセス（開発用） |

### ルーティング

- `/api/*` → FastAPI コンテナ (port 8080) へ Nginx がプロキシ
- それ以外 → `front/` 以下の静的 HTML ファイルを返却

## API エンドポイント

| メソッド | パス | 説明 |
|--------|------|------|
| GET | `/api/hello` | `Hello from Python!` を返す |
| GET | `/api/good_night` | `Good night from Python!` を返す |

## 技術スタック

- **バックエンド**: Python 3.14 / FastAPI / Uvicorn
- **フロントエンド**: React 18 (CDN) / Babel Standalone / CSS
- **インフラ**: Docker Compose / Nginx

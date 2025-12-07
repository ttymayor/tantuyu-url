# tantuyu-url

這是我的短網址服務，大概 80% Vibe Coding。

## Docker Compose 部署

使用 Docker Compose 快速部署應用程式：

### 設定環境變數

複製 `.env.example` 並建立 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入必要的環境變數：

```env
BETTER_AUTH_SECRET=                         # 自行生成你的 Secret
BETTER_AUTH_URL=http://localhost:3000       # 部屬時請改為自己的網域

DB_FILE_NAME=sqlite.db

IPINFO_TOKEN=                               # 用於紀錄請求來源，可於 https://ipinfo.io 申請帳號

NEXT_PUBLIC_BASE_URL=http://localhost:3000  # 部屬時請改為網址的根目錄
DOMAIN_NAME=localhost:3000                  # 部屬時請改為自己的網域

DOCKER_IMAGE_NAME=                          # 欲使用 Docker compose 建置可以填入 huangmayor0905/tantuyu-url:latest
```

### 啟動服務

```bash
docker-compose up -d
```

### 停止服務

```bash
docker-compose down
```

# tantuyu-url

這是我的短網址服務，大概 80% Vibe Coding。

## Docker Compose 部署

使用 Docker Compose 快速部署應用程式：

### 1. 設定環境變數

複製 `.env.example` 並建立 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入必要的環境變數：

```env
BETTER_AUTH_SECRET=  # 自行生成你的 Secret
BETTER_AUTH_URL=http://localhost:3000       # 部屬時請改為自己的網域

DB_FILE_NAME=sqlite.db

IPINFO_TOKEN=                               # 用於紀錄請求來源，可於 https://ipinfo.io 申請帳號

NEXT_PUBLIC_BASE_URL=http://localhost:3000  # 部屬時請改為網址的根目錄
DOMAIN_NAME=localhost:3000                  # 部屬時請改為自己的網域

# 欲使用 Docker compose 建置可以使用該 Image
DOCKER_IMAGE_NAME=huangmayor0905/tantuyu-url:latest
```

### 2. 啟動服務

```bash
docker-compose up -d
```

應用程式將在 `http://localhost:3000` 上運行。

### 3. 查看日誌

```bash
docker-compose logs -f
```

### 4. 停止服務

```bash
docker-compose down
```

資料庫檔案會保存在 `./data` 目錄中，即使容器停止也不會遺失。

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

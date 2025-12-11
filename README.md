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
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DOMAIN_NAME=localhost:3000
BETTER_AUTH_SECRET=your_random_secret_here
BETTER_AUTH_URL=http://localhost:3000
IPINFO_TOKEN=your_ipinfo_token

# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/tantuyu
```

### 啟動服務

```bash
docker-compose up -d
```

### 停止服務

```bash
docker-compose down
```

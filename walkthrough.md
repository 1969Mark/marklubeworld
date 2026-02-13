# AI 助理整合完成報告

## 實作摘要

已將 AI 聊天助理整合至 **Mark's Lubricant World** 網站，使用 Google Gemini 2.0 Flash API 根據網站知識庫回答潤滑油技術問題。

## 完成項目

### 1. 知識庫建構
- 建立 PowerShell 腳本 [build-knowledge.ps1](file:///D:/AntiGravity/marklubeworld/scripts/build-knowledge.ps1) 從 30+ 篇 HTML 文章中提取文字內容
- 產生 [knowledge_base.json](file:///D:/AntiGravity/marklubeworld/knowledge_base.json)（215 KB），涵蓋所有主題分類

### 2. Vercel Serverless API
- [api/chat.js](file:///D:/AntiGravity/marklubeworld/api/chat.js) — 處理前端聊天請求，將知識庫注入 Gemini system prompt，支援對話歷史

### 3. 前端聊天介面
- [chatbot.css](file:///D:/AntiGravity/marklubeworld/styles/chatbot.css) — 浮動按鈕（藍色圓形 FAB）、漸變標題欄、氣泡訊息、打字指示器
- [chatbot.js](file:///D:/AntiGravity/marklubeworld/scripts/chatbot.js) — 開關視窗、發送訊息、Markdown 渲染、快速提問按鈕

### 4. 頁面整合
- 已修改 [index.html](file:///D:/AntiGravity/marklubeworld/index.html) 及 `links/` 下全部 30 個子頁面

### 5. 專案配置
| 檔案 | 用途 |
|------|------|
| [package.json](file:///D:/AntiGravity/marklubeworld/package.json) | 依賴管理（`@google/generative-ai`） |
| [vercel.json](file:///D:/AntiGravity/marklubeworld/vercel.json) | API 路由與 CORS 設定 |
| `.env` | 本地 API Key 儲存（不上傳 Git） |
| `.gitignore` | 排除 `.env`、`node_modules` |

## 部署步驟

> [!IMPORTANT]
> 需要先安裝 Node.js 才能進行本地測試與部署。

### Step 1：安裝 Node.js
前往 https://nodejs.org 下載安裝 LTS 版本

### Step 2：安裝依賴
```bash
cd D:\AntiGravity\marklubeworld
npm install
```

### Step 3：設定 Vercel 環境變數
```bash
# 在 Vercel Dashboard > Settings > Environment Variables 新增：
GEMINI_API_KEY=AIzaSyD7w_iDsyH7A1chJwpKQdcUyNDRDOiMZ9c
```

### Step 4：本地測試（選用）
```bash
npm run dev
# 開啟 http://localhost:3000 測試聊天功能
```

### Step 5：部署
```bash
git add .
git commit -m "feat: integrate AI chatbot with Gemini API"
git push
```
Vercel 會自動觸發部署，部署完成後即可在 marklubeworld.vercel.app 使用 AI 助理。

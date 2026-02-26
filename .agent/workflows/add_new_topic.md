---
description: 新增技術文章到 marklubeworld 網站並部署到 GitHub
---

# 📋 前置資訊（新對話時請提供）

「/add_new_topic 幫我新增一篇關於 [主題] 的文章，分類是 [一般潤滑油/船舶潤滑油/機械設備]，內容是……」,使用 /add_new_topic 這個斜線指令時，AI 會先讀取這個 Skill 檔案，然後按步驟執行，你不需要每次重新描述流程。

使用本工作流程前，使用者需提供以下資訊：
- **文章標題**：例如 `2026_XXXX`
- **文章分類**：`一般潤滑油` / `船舶潤滑油` / `機械設備`
- **HTML 檔案名稱**：例如 `my_topic.html`
- **卡片簡介**：顯示在首頁卡片的一兩句描述
- **文章內容**：完整的技術文章內容（可分段提供）
- **附件簡報 PDF**（選填）：若有提供 PDF 檔案名稱（例如 `2026_XXX.pdf`），需將 PDF 放入 `d:\AntiGravity\marklubeworld\links\` 目錄，並在文章頁面加入下載區塊

---

# 🔧 工作流程步驟

## 步驟 1：建立文章 HTML 檔案

在 `d:\AntiGravity\marklubeworld\links\[filename].html` 建立新 HTML 檔案。

使用以下模板（替換 `[TITLE]`、`[KEYWORDS]` 等佔位符）：

```html
<!doctype html>
<html lang="zh-Hant">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="[KEYWORDS]">
    <link rel="icon" type="image/png" href="../images/mark_small.png">
    <title>[TITLE]</title>
    <link rel="stylesheet" href="../styles/web.css">
    <link rel="stylesheet" href="../styles/chatbot.css">
    <style>
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            overflow: hidden;
        }
        .info-table th, .info-table td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .info-table th {
            background: var(--ocean-deep);
            color: white;
            font-weight: 600;
        }
        .info-table tr:hover { background: rgba(100, 150, 200, 0.1); }
        .highlight-box {
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(100, 150, 200, 0.15), rgba(255, 200, 100, 0.1));
            border-radius: 12px;
            border-left: 5px solid var(--ocean-mid);
            margin: 1.5rem 0;
        }
        .warning-box {
            padding: 1rem;
            background: rgba(255, 200, 100, 0.2);
            border-radius: 8px;
            border-left: 4px solid #f0ad4e;
            margin: 1rem 0;
        }
        .success-box {
            padding: 1rem;
            background: rgba(200, 255, 200, 0.2);
            border-radius: 8px;
            border-left: 4px solid #5cb85c;
            margin: 1rem 0;
        }
        .section-title {
            color: var(--ocean-deep);
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--sun-gold);
        }
        .sub-section {
            color: var(--ocean-mid);
            margin: 1.5rem 0 0.5rem;
        }
    </style>
</head>

<body>
    <!-- Header -->
    <div class="top_main">
        <h1 style="font-size:28px;">[TITLE]</h1>
        <a href="../index.html">回首頁</a>
        <img src="../images/mark_small.png" height="100px" />
    </div>

    <hr>

    <main>
        <div class="container">

            <!-- 摘要 -->
            <div class="highlight-box">
                <p>[SUMMARY_PARAGRAPH]</p>
            </div>

            <!-- ========== 第一部分 ========== -->
            <h2 class="section-title">[SECTION_1_TITLE]</h2>
            <p>[SECTION_1_CONTENT]</p>

            <!-- 在此依需要擴充更多章節 -->

            <!-- ========== 參考文件下載（選填，無 PDF 時刪除此區塊）========== -->
            <!-- PDF 檔案須放在 d:\AntiGravity\marklubeworld\files\ 目錄，路徑前綴為 ../files/ -->
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.5); border-radius: 8px; border-left: 5px solid var(--sun-gold);">
                <h3>參考文件</h3>
                <p>
                    <a href="../files/[PDF_FILENAME]" target="_blank"
                        style="font-weight: bold; color: var(--ocean-mid);">
                        下載簡報資料: [PDF_FILENAME]
                    </a>
                </p>
            </div>

        </div>
    </main>


    <footer>
        <div style="text-align: center; padding: 2rem;">
            <h5>
                <p>如果對文章內容有疑慮，歡迎來信討論指教</p>
                <a href="mailto:mark.chuangjj@gmail.com">email to me (Mark CHUANG)</a>
            </h5>
        </div>
    </footer>

    <!-- AI Chatbot -->
    <script src="../scripts/chatbot.js"></script>
</body>

</html>
```

---

## 步驟 2：更新首頁 index.html，新增文章卡片

開啟 `d:\AntiGravity\marklubeworld\index.html`。

根據文章分類，在對應區段 `<div class="topic-grid">` 的**最前面**（最新文章置頂）插入卡片：

**一般潤滑油分類**（在 `<!-- General Lubes Cards - 2026 -->`  下方）：
```html
<a href="links/[FILENAME].html" class="card">
    <h3>[TITLE]</h3>
    <p>[CARD_DESCRIPTION]</p>
</a>
```

**船舶潤滑油分類**（在 `<!-- Marine Lubes Cards - 2026 -->` 下方）：
```html
<a href="links/[FILENAME].html" class="card marine">
    <h3>[TITLE]</h3>
    <p>[CARD_DESCRIPTION]</p>
</a>
```

**機械設備分類**（在 `<h3 style="...">機械設備</h3>` 下方 `<div class="topic-grid">` 內）：
```html
<a href="links/[FILENAME].html" class="card equipment">
    <h3>[TITLE]</h3>
    <p>[CARD_DESCRIPTION]</p>
</a>
```

> **注意**：卡片的 class 區分：
> - 一般潤滑油 → `class="card"`
> - 船舶潤滑油 → `class="card marine"`
> - 機械設備   → `class="card equipment"`

---

## 步驟 3：部署到 GitHub

在專案根目錄執行以下指令：

```powershell
cd d:\AntiGravity\marklubeworld
git add .
git commit -m "新增文章：[TITLE]"
git push origin main
```

---

## 步驟 4：驗證部署

1. 等待約 30-60 秒讓 Vercel 自動部署完成
2. 瀏覽器開啟 `https://marklubeworld.vercel.app` 確認首頁卡片已顯示
3. 點入文章卡片，確認文章頁面內容正確顯示

---

# ✅ 完成清單

- [ ] 建立 `links/[filename].html` 文章頁面
- [ ] 更新 `index.html` 新增文章卡片（正確 class）
- [ ] git commit 並 push 到 GitHub
- [ ] 驗證 Vercel 部署成功，線上頁面顯示正確
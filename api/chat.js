const fs = require("fs");
const path = require("path");

// Switch to Flash-Lite which often has separate or larger free tier quota
const MODEL_NAME = "gemini-2.0-flash-lite-001";

function loadKnowledgeBase() {
  try {
    const kbPath = path.join(process.cwd(), "knowledge_base.json");
    if (!fs.existsSync(kbPath)) return "知識庫檔案缺失。";
    const data = fs.readFileSync(kbPath, "utf-8");
    const articles = JSON.parse(data);
    // Restore full knowledge base
    return articles.map((a, i) => `--- 文章 ${i+1}: ${a.title} ---\n分類: ${a.category}\n內容: ${a.content}\n`).join("\n");
  } catch (e) {
    return "KB_LOAD_ERROR: " + e.message;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Using the new API Key provided by the user
    const apiKey = "AIzaSyCG8nIgzPLwu40oqs8H2zeNBmCYhF9Lp4g";
    const { message, history } = req.body || {};
    
    if (!apiKey) throw new Error("GEMINI_API_KEY 未設定，請檢查 Vercel 環境變數。");
    if (!message) throw new Error("請輸入訊息內容。");

    const kb = loadKnowledgeBase();
    const systemPrompt = `你是「Mark's Lubricant World」網站 AI 助理。請用繁體中文回答技術問題。請根據以下知識庫提供專業回覆，並引用標題與連結。\n\n[知識庫開始]\n${kb}\n[知識庫結束]`;

    const contents = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        system_instruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      const errMsg = data.error?.message || "Google API 未知錯誤";
      
      // Special handling for Quota issues
      if (errMsg.includes("quota") || errMsg.includes("limit")) {
        return res.status(200).json({
          error: "⚠️ AI 助理目前今日額度已用盡，請稍後或明日再試。若您是站長，請檢查 Google AI Studio 配額限制。",
          detail: errMsg,
          success: false
        });
      }
      
      throw new Error(errMsg);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我暫時無法產生內容，請換個方式詢問。";
    res.status(200).json({ reply: reply, success: true });

  } catch (error) {
    console.error("Chat API Handler Error:", error.message);
    res.status(200).json({
      error: error.message || "發生連線錯誤，請稍後再試。",
      success: false
    });
  }
};

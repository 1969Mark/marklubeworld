const fs = require("fs");
const path = require("path");

// ==========================================================
// 1. Configuration
// ==========================================================
/** 
 * Use gemini-1.5-flash as the stable flagship for now. 
 * As of Feb 2026, it is widely supported across all regions.
 */
const MODEL_NAME = "gemini-1.5-flash"; 
const MAX_OUTPUT_TOKENS = 2048;
const TEMPERATURE = 0.7;

// ==========================================================
// 2. Knowledge Base Loader
// ==========================================================
let cachedKB = null;

function loadKnowledgeBase() {
  if (cachedKB) return cachedKB;

  const possiblePaths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];

  let rawData = null;
  for (const kbPath of possiblePaths) {
    try {
      if (fs.existsSync(kbPath)) {
        rawData = fs.readFileSync(kbPath, "utf-8");
        break;
      }
    } catch (e) {}
  }

  if (!rawData) throw new Error("知識庫加載失敗：檔案不存在");
  
  const articles = JSON.parse(rawData);
  cachedKB = articles.map((article, index) => 
    `--- 文章 ${index + 1}: ${article.title} ---\n` +
    `分類: ${article.category}\n` +
    `網址: ${article.url}\n` +
    `內容: ${article.content}\n`
  ).join("\n");

  return cachedKB;
}

// ==========================================================
// 4. API Handler (Native Fetch Implementation)
// ==========================================================
module.exports = async function handler(req, res) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY 未設定");

    // Vercel auto-parses body for .js files usually
    const { message, history } = req.body || {};
    if (!message) throw new Error("請輸入問題後再試。");

    // 1. Prepare Prompt
    const kbText = loadKnowledgeBase();
    const systemPrompt = `你是「Mark's Lubricant World」網站的 AI 助理。請用繁體中文回答，基於以下知識庫。回答時引用相關標題與連結。\n\n知識庫：\n\n${kbText}`;

    // 2. Build History Contents
    const contents = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    // 3. Call Gemini API Directly
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: TEMPERATURE
        }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || `API 回應錯誤 (${apiResponse.status})`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error("AI 無法產生回應，可能是內容被封鎖或模型無效。");
    }

    res.status(200).json({
      reply: reply,
      success: true
    });

  } catch (error) {
    console.error("Chat Handler Error:", error.message);
    res.status(500).json({
      error: error.message || "發生未知錯誤",
      success: false
    });
  }
};

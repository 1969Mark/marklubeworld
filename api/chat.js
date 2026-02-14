const fs = require("fs");
const path = require("path");

// ==========================================================
// 1. Configuration (Verified via listModels)
// ==========================================================
const MODEL_NAME = "gemini-2.5-flash"; 
const MAX_OUTPUT_TOKENS = 2048;
const TEMPERATURE = 0.7;

/**
 * Load knowledge base raw data
 */
function loadKnowledgeBase() {
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

  if (!rawData) throw new Error("知識庫加載失敗");
  
  let articles = JSON.parse(rawData);
  // REDUCE TO 2 ARTICLES FOR TESTING
  articles = articles.slice(0, 2);
  
  return articles.map((a, i) => `--- 文章 ${i+1}: ${a.title} ---\n分類: ${a.category}\n內容: ${a.content}\n`).join("\n");
}

// ==========================================================
// 2. API Handler (Direct Fetch Implementation)
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

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key 未設定");

    // Standard Vercel body parsing
    const { message, history } = req.body || {};
    if (!message) throw new Error("請提供問題");

    const kbContent = loadKnowledgeBase();
    const systemPrompt = `你是「Mark's Lubricant World」網站的 AI 助理。請用繁體中文回答，基於以下知識庫。回答時引用相關標題與連結。\n\n知識庫：\n\n${kbContent}`;

    // Build History
    const contents = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    // Call Google Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { 
          parts: [{ text: systemPrompt }] 
        },
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: TEMPERATURE
        }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.error?.message || `Gemini API Error (${apiResponse.status})`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("AI 未能回傳有效回覆。");

    res.status(200).json({
      reply: reply,
      success: true
    });

  } catch (error) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
};

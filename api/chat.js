// ==========================================================
// 1. Dependencies & Configuration
// ==========================================================
const fs = require("fs");
const path = require("path");

/** @type {string} Gemini model identifier */
const MODEL_NAME = "gemini-2.5-flash";

/** @type {number} Maximum tokens for response */
const MAX_OUTPUT_TOKENS = 2048;

/** @type {number} Temperature for response creativity */
const TEMPERATURE = 0.7;

// ==========================================================
// 2. Knowledge Base Loader
// ==========================================================

function loadKnowledgeBaseRaw() {
  const possiblePaths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];

  for (const kbPath of possiblePaths) {
    try {
      if (fs.existsSync(kbPath)) {
        return fs.readFileSync(kbPath, "utf-8");
      }
    } catch (e) {
      console.error("Read error at", kbPath, e.message);
    }
  }
  throw new Error("知識庫檔案不存在");
}

// ==========================================================
// 4. API Handler
// ==========================================================

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  try {
    // Stage 1: Load Knowledge Base
    let articles;
    try {
      const rawData = loadKnowledgeBaseRaw();
      articles = JSON.parse(rawData);
    } catch (e) {
      res.status(500).json({ 
        error: "知識庫加載或解析失敗", 
        detail: e.message, 
        success: false 
      });
      return;
    }

    // Return KB stats for diagnosis
    res.status(200).json({
      articleCount: articles.length,
      lastArticle: articles[articles.length - 1]?.title,
      envKeySet: !!process.env.GEMINI_API_KEY,
      success: true,
      debug: "KB_DIAGNOSTICS"
    });

  } catch (error) {
    res.status(500).json({
      error: "致命錯誤",
      detail: error.message,
      success: false
    });
  }
};

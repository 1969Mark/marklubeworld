// ==========================================================
// 1. Dependencies & Configuration
// ==========================================================
const fs = require("fs");
const path = require("path");

/** @type {string} Gemini model identifier (stable version) */
const MODEL_NAME = "gemini-2.5-flash";

/** @type {number} Maximum tokens for response */
const MAX_OUTPUT_TOKENS = 2048;

/** @type {number} Temperature for response creativity */
const TEMPERATURE = 0.7;

// ==========================================================
// 2. Knowledge Base Loader (Cached)
// ==========================================================

/** @type {string|null} Cached knowledge base content */
let cachedKnowledgeBase = null;

/**
 * Load and cache the knowledge base JSON file
 * @returns {string} Formatted knowledge base text
 */
function loadKnowledgeBase() {
  if (cachedKnowledgeBase) {
    return cachedKnowledgeBase;
  }

  // Try multiple paths for Vercel compatibility
  const possiblePaths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];

  let rawData = null;
  for (const kbPath of possiblePaths) {
    try {
      rawData = fs.readFileSync(kbPath, "utf-8");
      console.log("Knowledge base loaded from:", kbPath);
      break;
    } catch (e) {
      console.log("KB not found at:", kbPath);
    }
  }

  if (!rawData) {
    throw new Error("Knowledge base file not found in any expected location");
  }

  /** @type {Array<{title: string, url: string, category: string, content: string}>} */
  const articles = JSON.parse(rawData);

  // Format articles into a structured text block for the prompt
  const formattedArticles = articles
    .map(
      (article, index) =>
        `--- Article ${index + 1}: ${article.title} ---\n` +
        `Category: ${article.category}\n` +
        `URL: ${article.url}\n` +
        `Content:\n${article.content}\n`
    )
    .join("\n");

  cachedKnowledgeBase = formattedArticles;
  return cachedKnowledgeBase;
}

// ==========================================================
// 3. System Prompt Builder
// ==========================================================

/**
 * Build the system instruction for Gemini
 * @param {string} knowledgeBase - Formatted knowledge base content
 * @returns {string} System prompt
 */
function buildSystemPrompt(knowledgeBase) {
  return `你是「Mark's Lubricant World」網站的 AI 助理，專門回答關於潤滑油、船舶引擎潤滑、油品化驗分析等技術問題。

## 你的角色
- 你是一位專業且友善的潤滑油技術顧問
- 使用繁體中文回答問題
- 回答時引用網站上的相關文章，並提供文章連結
- 若問題超出知識庫範圍，請誠實告知並建議使用者參考其他資源

## 回答規則
1. **基於知識庫**: 僅根據以下知識庫內容回答問題，不要編造資訊
2. **引用來源**: 回答時提及相關文章標題，並附上連結格式如 [文章名稱](網址)
3. **結構清晰**: 使用標題、列表、粗體等 Markdown 格式讓回答易讀
4. **語言**: 使用繁體中文回答，技術術語可附英文原文
5. **簡潔專業**: 回答應簡潔但完整，避免冗長

## 知識庫內容
以下是網站上所有文章的內容，請基於這些內容回答使用者的問題：

${knowledgeBase}`;
}

// ==========================================================
// 4. API Handler (using dynamic import for ESM @google/genai)
// ==========================================================

/**
 * Vercel Serverless Function handler
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    // Parse request body
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Load knowledge base
    let knowledgeBase;
    try {
      knowledgeBase = loadKnowledgeBase();
      console.log("Knowledge base loaded successfully, length:", knowledgeBase.length);
    } catch (e) {
      console.error("Failed to load knowledge base:", e.message);
      res.status(500).json({ error: "知識庫加載失敗", detail: e.message, success: false });
      return;
    }

    const systemPrompt = buildSystemPrompt(knowledgeBase);
    console.log("System prompt built, length:", systemPrompt.length);

    // Dynamic import for ESM-only @google/genai package
    console.log("Importing @google/genai...");
    const { GoogleGenAI } = await import("@google/genai");

    // Initialize Google GenAI SDK
    const ai = new GoogleGenAI({ apiKey });
    console.log("AI client initialized with model:", MODEL_NAME);

    // Build chat history in SDK format
    /** @type {Array<{role: string, parts: Array<{text: string}>}>} */
    const chatHistory = Array.isArray(history)
      ? history.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }))
      : [];

    console.log("History turns:", chatHistory.length);

    // Create chat session
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
      },
    });

    // Send message
    console.log("Sending message to Gemini...");
    const result = await chat.sendMessage({ message });
    const responseText = result.text;
    console.log("Received response successfully");

    res.status(200).json({
      reply: responseText,
      success: true,
    });
  } catch (error) {
    console.error("Chat API Fatal Error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({
      error: "AI 助理暫時無法回應，請稍後再試。",
      detail: error.message,
      stack: error.stack,
      success: false,
    });
  }
};

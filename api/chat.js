const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-1.5-flash"; // Use the most stable fallback
const MAX_OUTPUT_TOKENS = 2048;
const TEMPERATURE = 0.7;

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
  if (!rawData) throw new Error("知識庫不存在");
  
  const articles = JSON.parse(rawData);
  return articles.map((a, i) => `--- Article ${i+1}: ${a.title} ---\nCategory: ${a.category}\nURL: ${a.url}\nContent:\n${a.content}\n`).join("\n");
}

function buildSystemPrompt(kb) {
  return `你是「Mark's Lubricant World」網站的 AI 助理。請用繁體中文回答，基於以下知識庫內容：\n\n${kb}`;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const { message, history } = req.body || {};
    if (!message) throw new Error("Message missing");

    const kbContent = loadKnowledgeBase();
    const systemPrompt = buildSystemPrompt(kbContent);

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    
    const chatHistory = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
      },
    });

    const result = await chat.sendMessage({ message });
    
    res.status(200).json({
      reply: result.text,
      success: true
    });

  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    res.status(500).json({
      error: "連線失敗：" + error.message,
      stack: error.stack,
      success: false
    });
  }
};

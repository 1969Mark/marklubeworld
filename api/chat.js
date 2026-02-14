const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-2.0-flash";

function loadKnowledgeBase(limit = 5) {
  const possiblePaths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];

  let rawData = null;
  for (const kbPath of possiblePaths) {
    try {
      if (fs.existsSync(kbPath)) { rawData = fs.readFileSync(kbPath, "utf-8"); break; }
    } catch (e) {}
  }
  if (!rawData) return "KB_NOT_FOUND";
  const articles = JSON.parse(rawData);
  // TEST WITH 5 ARTICLES TO SPEED UP
  return articles.slice(0, limit).map((a, i) => `[${a.title}]\n${a.content}`).join("\n\n");
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
    const { message, history } = req.body || {};
    if (!message) throw new Error("EMPTY_MESSAGE");

    const kbText = loadKnowledgeBase(5); // Start with 5 articles
    const systemPrompt = `你是 Mark's Lubricant World AI。請基於以下知識庫回答問題。推薦相關文章連結。\n\n[知識庫]\n${kbText}`;

    const contents = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error(data.error?.message || "GOOGLE_ERROR");

    res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_REPLY",
      success: true
    });

  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

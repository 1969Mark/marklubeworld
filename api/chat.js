const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-2.0-flash";
const MAX_OUTPUT_TOKENS = 1024;

function loadKnowledgeBase(limit = 3) {
  const possiblePaths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];
  let rawData = null;
  for (const p of possiblePaths) {
    try { if (fs.existsSync(p)) { rawData = fs.readFileSync(p, "utf-8"); break; } } catch (e) {}
  }
  if (!rawData) throw new Error("KB_MISSING");
  const articles = JSON.parse(rawData);
  return articles.slice(0, limit).map((a, i) => `[${a.title}]\n${a.content}`).join("\n\n");
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { message, history } = req.body || {};
    if (!message) throw new Error("NO_MESSAGE");

    const kbText = loadKnowledgeBase(3);
    const systemPrompt = `你是 Mark's Lubricant World AI 助理。請用繁體中文回答。知識庫：\n${kbText}`;

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
        system_instruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error(data.error?.message || "API_ERROR");

    res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_RESPONSE",
      success: true
    });

  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

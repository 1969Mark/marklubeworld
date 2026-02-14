const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-1.5-flash";

function loadKnowledgeBase() {
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
  if (!rawData) return "KNOWLDGE_BASE_NOT_FOUND";
  const articles = JSON.parse(rawData);
  // TEST WITH 10 ARTICLES (~30-40KB)
  return articles.slice(0, 10).map((a, i) => `[${a.title}]\n${a.content}`).join("\n\n");
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body || {};
    
    const kbText = loadKnowledgeBase();
    
    // REPLICATE STEP 377 STRUCTURE: Minimal contents array
    const combinedText = `你是專業 AI 助理。請繁體中文回答。\n\n知識庫：\n${kbText}\n\n使用者問題：\n${message || "Ping"}`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: combinedText }] }]
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error(data.error?.message || "GOOGLE_API_ERROR");

    res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_REPLY",
      success: true,
      debug: "STRUCTURE_REPLICATED"
    });

  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

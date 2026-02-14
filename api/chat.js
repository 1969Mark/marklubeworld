const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-2.0-flash";

function loadKB() {
  try {
    const kbPath = path.join(process.cwd(), "knowledge_base.json");
    if (!fs.existsSync(kbPath)) return "知識庫不存在";
    const data = fs.readFileSync(kbPath, "utf-8");
    const articles = JSON.parse(data);
    // Limit to 10 articles for stability
    return articles.slice(0, 10).map(a => `[${a.title}]\n${a.content}`).join("\n\n");
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
    const apiKey = process.env.GEMINI_API_KEY;
    const { message, history } = req.body || {};
    
    if (!apiKey) throw new Error("GEMINI_API_KEY 未設定");
    if (!message) throw new Error("請輸入問題");

    const kb = loadKB();
    const systemPrompt = `你是「Mark's Lubricant World」網站 AI 助理。請用繁體中文回答，基於以下知識庫：\n\n${kb}`;

    const contents = (history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    // Set a 25s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        system_instruction: { parts: [{ text: systemPrompt }] }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await apiRes.json();

    if (!apiRes.ok) {
      // Return 200 so we can see the error in UI instead of a generic connection error
      return res.status(200).json({
        error: data.error?.message || `Google API Error (${apiRes.status})`,
        success: false
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "無回應";
    res.status(200).json({ reply, success: true });

  } catch (error) {
    console.error("API Handler Error:", error);
    res.status(200).json({
      error: error.name === "AbortError" ? "請求連線超時，請稍後再試。" : error.message,
      success: false
    });
  }
};

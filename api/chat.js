const fs = require("fs");
const path = require("path");

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
  if (!rawData) return "KB_NOT_FOUND";
  const articles = JSON.parse(rawData);
  return articles.map((a, i) => `[${a.title}]\n${a.content}`).join("\n\n");
}

module.exports = async function handler(req, res) {
  try {
    const kbText = loadKnowledgeBase();
    const { message } = req.body || {};
    
    const combinedPrompt = `[知識庫開始]\n${kbText}\n[知識庫結束]\n問題: ${message}`;
    
    const contents = [{ role: 'user', parts: [{ text: combinedPrompt }] }];

    res.status(200).json({
      promptLength: combinedPrompt.length,
      sample: combinedPrompt.substring(0, 100),
      contents: contents, // Return the whole thing
      success: true,
      debug: "PAYLOAD_TEST"
    });

  } catch (error) {
    res.status(200).json({ error: error.message, success: false });
  }
};

const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-2.0-flash"; // Try 2.0 Flash

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

  if (!rawData) return "EMPTY";
  
  const articles = JSON.parse(rawData);
  return articles.length + " articles";
}

module.exports = async function handler(req, res) {
  try {
    const kbStats = loadKnowledgeBase();
    const apiKey = process.env.GEMINI_API_KEY;

    res.status(200).json({
      kbStats: kbStats,
      model: MODEL_NAME,
      hasKey: !!apiKey,
      success: true,
      debug: "PATH_VERIFIED"
    });
  } catch (error) {
    res.status(200).json({ error: error.message, success: false });
  }
};

const fs = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  const info = {
    cwd: process.cwd(),
    dirname: __dirname,
    nodeVersion: process.version,
    envKeys: Object.keys(process.env).filter(k => k.startsWith("GEMINI") || k === "NODE_ENV"),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  };

  // Check knowledge base file
  const paths = [
    path.join(__dirname, "..", "knowledge_base.json"),
    path.join(process.cwd(), "knowledge_base.json"),
  ];

  info.kbSearchPaths = paths;
  info.kbFound = {};

  for (const p of paths) {
    try {
      const stat = fs.statSync(p);
      info.kbFound[p] = { exists: true, size: stat.size };
    } catch (e) {
      info.kbFound[p] = { exists: false, error: e.message };
    }
  }

  // List files in cwd
  try {
    info.cwdFiles = fs.readdirSync(process.cwd()).slice(0, 20);
  } catch (e) {
    info.cwdFiles = "Error: " + e.message;
  }

  // List files in dirname parent
  try {
    info.dirFiles = fs.readdirSync(path.join(__dirname, "..")).slice(0, 20);
  } catch (e) {
    info.dirFiles = "Error: " + e.message;
  }

  // Test require @google/genai
  try {
    const { GoogleGenAI } = require("@google/genai");
    info.genaiLoaded = true;
    info.genaiType = typeof GoogleGenAI;
  } catch (e) {
    info.genaiLoaded = false;
    info.genaiError = e.message;
  }

  res.status(200).json(info);
};

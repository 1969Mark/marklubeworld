const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-1.5-flash";

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body || {};

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    console.log("Fetching from Google...");
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message || "Hello" }] }]
      })
    });

    const data = await apiRes.json();

    // Directly return whatever Google says
    res.status(200).json({
      googleStatusCode: apiRes.status,
      googleResponse: data,
      apiKeyLength: apiKey ? apiKey.length : 0,
      success: apiRes.ok
    });

  } catch (error) {
    res.status(200).json({
      error: error.message,
      stack: error.stack,
      success: false,
      debug: "CATCH_BLOCK"
    });
  }
};

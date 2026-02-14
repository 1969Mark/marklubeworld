const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-1.5-flash";

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const bodyType = typeof req.body;
    let message = "";
    
    // Attempt to handle both pre-parsed and stream body
    if (bodyType === "object" && req.body !== null) {
      message = req.body.message;
    } else {
      // If it's a stream or something else, it might be the cause
      console.log("Body is not an object:", bodyType);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Very simple fetch to prove connectivity
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message || "Ping" }] }]
      })
    });
    
    const data = await apiRes.json();
    
    res.status(200).json({
      bodyType: bodyType,
      hasMessage: !!message,
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response",
      success: true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
};

module.exports = async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();
    
    res.status(200).json({
      models: data.models ? data.models.map(m => m.name) : data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

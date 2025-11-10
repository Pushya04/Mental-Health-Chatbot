const { PythonShell } = require('python-shell');
const path = require('path');

function detectEmotionFlag(text) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', 'alertController.py');
    PythonShell.run(scriptPath, { args: [text] }, (err, results) => {
      if (err || !results || !results.length) {
        console.error("Python error:", err?.message);
        return resolve({ flag: 0, emotion: 'neutral', suicideProb: 0.0 });
      }

      try {
        const last = results[results.length - 1];
        const parsed = JSON.parse(last);
        const suicideProb = parsed.suicide_prob || 0.0;
        const severeFlag = suicideProb >= 0.5 ? 1 : 0;

        resolve({
          flag: severeFlag,
          emotion: parsed.emotion || 'neutral',
          suicideProb
        });
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        resolve({ flag: 0, emotion: 'neutral', suicideProb: 0.0 });
      }
    });
  });
}
// server/utils/emotion.js
const axios = require('axios');

async function inferEmotionLabel(text) {
  try {
    const { data } = await axios.post('http://127.0.0.1:8000/predict_emotion', { text });
    return data?.emotion || 'neutral';
  } catch (e) {
    // fallback rule if API is down
    const t = (text || '').toLowerCase();
    if (/(anxious|anxiety|nervous|panic)/.test(t)) return 'anxiety';
    if (/(sad|down|cry|alone|depress)/.test(t)) return 'sadness';
    if (/(angry|mad|rage)/.test(t)) return 'anger';
    if (/(fear|scared|terrified)/.test(t)) return 'fear';
    return 'neutral';
  }
}

module.exports = { inferEmotionLabel };

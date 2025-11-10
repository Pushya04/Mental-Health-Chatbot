const music = [
  { label: '2-minute focus music', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04' },
  { label: 'Box breathing (guided, 2-min)', url: 'https://www.youtube.com/watch?v=tEmt1Znux58' },
];

const quotes = [
  { text: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
];

function suggest(intent) {
  if (intent === 'seeking_motivation' || intent === 'emotional_support') {
    return { type: 'music', ...music[Math.floor(Math.random() * music.length)] };
  }
  return null;
}

function getQuote(intent) {
  if (intent === 'seeking_motivation' || intent === 'general_support') {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  return null;
}

module.exports = { suggest, getQuote };

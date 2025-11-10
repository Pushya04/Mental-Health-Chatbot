// very simple rules — can be replaced by a classifier later
function inferIntent(text, emotion) {
  const t = (text || '').toLowerCase();
  if (/(help|advice|what do i do|how to)/.test(t)) return 'seeking_guidance';
  if (/(anxious|anxiety|nervous|panic)/.test(t) || emotion === 'nervousness') return 'seeking_motivation';
  if (/(sad|down|cry|alone|depressed)/.test(t) || emotion === 'sadness') return 'emotional_support';
  if (/(angry|mad|rage)/.test(t) || emotion === 'anger') return 'deescalation';
  return 'general_support';
}

module.exports = { inferIntent };

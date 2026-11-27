// Answers direct questions about the seeded schemes ("PM-KISAN में कितना पैसा मिलता है?",
// "documents for e-Shram?"). Every answer is assembled from src/data/schemes.json only.
import { norm } from './parser.js';
import { SCHEMES } from './engine.js';
import { t } from './i18n.js';

const N = (l) => l.map(norm);

const ALIASES = {
  'pm-kisan': N(['pm kisan', 'pmkisan', 'पीएम किसान', 'प्रधानमंत्री किसान', 'किसान सम्मान', 'kisan samman', 'kisan nidhi', 'सम्मान निधि']),
  pmfby: N(['fasal bima', 'फसल बीमा', 'crop insurance', 'pmfby', 'फसल का बीमा']),
  kcc: N(['kcc', 'kisan credit', 'किसान क्रेडिट', 'केसीसी', 'crop loan', 'फसल लोन', 'kisan card', 'किसान कार्ड']),
  'vay-vandana': N(['vay vandana', 'वय वंदना', 'ayushman', 'आयुष्मान', 'health card', 'मुफ्त इलाज', 'free treatment', 'pmjay', 'pm jay']),
  'haryana-oasa': N(['old age', 'budhapa', 'बुढापा', 'वृद्धावस्था', 'samman allowance', 'सम्मान भत्ता', 'वृद्धा पेंशन', 'buzurg pension', 'बुजुर्ग पेंशन']),
  'pm-sym': N(['maandhan', 'mandhan', 'मानधन', 'मान धन', 'shram yogi', 'श्रम योगी', 'pm sym', 'pmsym', 'mazdoor pension', 'मजदूर पेंशन']),
  'e-shram': N(['e shram', 'eshram', 'ई श्रम', 'ईश्रम', 'shram card', 'श्रम कार्ड', 'labour card', 'लेबर कार्ड']),
  pmsby: N(['suraksha bima', 'सुरक्षा बीमा', 'pmsby', 'accident insurance', 'accident cover', 'दुर्घटना बीमा']),
  pmjjby: N(['jeevan jyoti', 'jivan jyoti', 'जीवन ज्योति', 'pmjjby', 'life insurance', 'life cover', 'जीवन बीमा']),
  pmmvy: N(['matru vandana', 'मातृ वंदना', 'pmmvy', 'मातृत्व', 'matritva', 'maternity']),
  onorc: N(['one nation', 'ek desh', 'एक देश', 'onorc', 'mera ration', 'मेरा राशन', 'ration portability', 'ration kahin bhi', 'राशन कहीं भी']),
};

const INTENTS = {
  amount: N(['kitna', 'kitne', 'कितना', 'कितने', 'कितनी', 'how much', 'amount', 'paisa', 'पैसा', 'पैसे', 'benefit', 'लाभ', 'fayda', 'फायदा', 'milta', 'मिलता', 'मिलती', 'milti', 'मिलेगा', 'milega', 'cover']),
  who: N(['kaun', 'कौन', 'who', 'eligible', 'eligibility', 'patra', 'पात्र', 'yogya', 'योग्य', 'shart', 'शर्त', 'kise', 'किसे', 'किसको', 'can i get', 'qualify']),
  docs: N(['document', 'kagaz', 'kagaj', 'कागज', 'दस्तावेज', 'dastavej', 'papers', 'kya chahiye', 'क्या चाहिए', 'kya lagega', 'क्या लगेगा', 'required', 'proof']),
  apply: N(['apply', 'aavedan', 'avedan', 'आवेदन', 'kaise', 'कैसे', 'how to', 'how do', 'how can', 'kahan', 'कहां', 'where', 'register', 'पंजीकरण', 'form', 'फॉर्म', 'link', 'website', 'site', 'banwa', 'बनवा', 'बनेगा', 'banega', 'online']),
  status: N(['status', 'स्टेटस', 'kist nahi', 'किस्त नहीं', 'paisa nahi aaya', 'पैसा नहीं आया', 'not received', 'nahi aaya', 'नहीं आया', 'नहीं आई', 'nahi aayi', 'kab aayega', 'कब आएगा', 'kab milega', 'कब मिलेगा']),
  what: N(['kya hai', 'क्या है', 'what is', 'what s', 'batao', 'बताओ', 'बताइए', 'bataiye', 'jankari', 'जानकारी', 'about', 'details', 'explain', 'samjhao', 'समझाओ']),
};

const GENERIC = {
  free: N(['agent', 'एजेंट', 'fees', 'fee', 'फीस', 'paisa lagega', 'पैसा लगेगा', 'पैसे लगेंगे', 'charge', 'free hai', 'मुफ्त है', 'muft hai', 'kitne paise lagenge', 'cost']),
  privacy: N(['aadhaar number', 'aadhar number', 'आधार नंबर', 'otp', 'ओटीपी', 'bank details', 'password', 'पासवर्ड', 'pin', 'safe', 'सुरक्षित', 'fraud', 'धोखा']),
  capability: N(['kya kar sakte', 'क्या कर सकते', 'what can you', 'what do you do', 'help', 'madad', 'मदद', 'which schemes', 'kaun si yojana', 'कौन सी योजना', 'कौनसी योजना', 'kaunsi yojana', 'all schemes', 'सभी योजना', 'list', 'लिस्ट', 'tum kaun', 'तुम कौन', 'aap kaun', 'आप कौन', 'who are you']),
};

function has(text, list) {
  const p = ` ${text} `;
  return list.some((k) => p.includes(` ${k}`));
}

export function findScheme(text) {
  const n = norm(text);
  for (const [id, list] of Object.entries(ALIASES)) if (has(n, list)) return id;
  return null;
}

const L = (lang, en, hi) => (lang === 'hi' ? hi : en);

/** Builds both a readable answer (with bullet lists) and a spoken one (with pauses). */
function schemeAnswer(s, intents, lang) {
  const text = [];
  const speech = [];
  const add = (label, items) => {
    const vals = items.map((x) => (typeof x === 'string' ? x : x[lang]));
    text.push(`${label}:\n${vals.map((v) => `• ${v}`).join('\n')}`);
    speech.push(`${label}: ${vals.join(', ')}.`);
  };
  const line = (str) => { text.push(str); speech.push(str); };
  text.push(s.officialName[lang]);
  speech.push(`${s.officialName[lang]}.`);
  if (intents.includes('status')) {
    line(L(lang,
      `I cannot see application or payment status. Check it on the official site${s.apply.online ? ` (${s.apply.online.label})` : ''} or ask where you applied.`,
      `मैं आवेदन या पैसे की स्थिति नहीं देख सकता। सरकारी साइट${s.apply.online ? ` (${s.apply.online.label})` : ''} पर देखें, या जहाँ आवेदन किया था वहाँ पूछें।`));
  }
  const general = !intents.length || intents.includes('what');
  if (intents.includes('amount') || general) line(`${L(lang, 'Benefit', 'लाभ')}: ${s.benefit.short[lang]}`);
  if (intents.includes('who') || general) {
    add(t('whoCanGet', lang), s.eligibility);
    if (s.exclusions.length) add(t('notFor', lang), s.exclusions);
  }
  if (intents.includes('docs')) add(t('documents', lang), s.documents);
  if (intents.includes('apply')) {
    if (s.apply.online) add(`${t('online', lang)} — ${s.apply.online.label}`, s.apply.online.steps);
    add(t('offline', lang), s.apply.offline);
    line(t('freeNote', lang));
  }
  return { text: text.join('\n\n'), speech: speech.join(' ') };
}

export function capabilityText(lang) {
  const names = SCHEMES.map((s) => s.officialName[lang].split(' (')[0]).join(', ');
  return L(lang,
    `I check ${SCHEMES.length} schemes: ${names}. Tell me about yourself — work, state, age — and I will tell you which fit. You can also ask about one scheme, like "What documents for e-Shram?"`,
    `मैं ${SCHEMES.length} योजनाएँ देखता हूँ: ${names}। अपने बारे में बताइए — काम, राज्य, उम्र — मैं बताऊँगा कौन-सी योजना काम की है। किसी एक योजना के बारे में भी पूछ सकते हैं, जैसे "ई-श्रम के लिए कौन-से कागज़ चाहिए?"`);
}

/**
 * Returns { text, speech, scheme? } when the text is a question this helper can answer,
 * otherwise null (the caller then treats it as a description of the person).
 */
export function answerQuestion(text, lang) {
  const n = norm(text);
  const isQuestion = /[?？]/.test(text);
  const intents = Object.entries(INTENTS).filter(([, l]) => has(n, l)).map(([k]) => k);
  const id = findScheme(text);
  if (id && (isQuestion || intents.length || n.split(' ').length <= 4)) {
    const s = SCHEMES.find((x) => x.id === id);
    const a = schemeAnswer(s, intents.filter((i) => i !== 'what' || intents.length === 1), lang);
    return { ...a, scheme: id };
  }
  if (has(n, GENERIC.free) && (isQuestion || intents.length)) {
    const a = t('freeNote', lang);
    return { text: a, speech: a };
  }
  if (has(n, GENERIC.privacy)) {
    const a = `${t('privacy', lang)} ${t('freeNote', lang)}`;
    return { text: a, speech: a };
  }
  if (has(n, GENERIC.capability)) {
    const a = capabilityText(lang);
    return { text: a, speech: a, browse: true };
  }
  return null;
}

export const QUESTION_EXAMPLES = {
  hi: ['पीएम किसान में कितना पैसा मिलता है?', 'ई-श्रम कार्ड के लिए कौन-से कागज़ चाहिए?', 'आयुष्मान वय वंदना कार्ड कैसे बनेगा?', 'आप क्या-क्या बता सकते हैं?'],
  en: ['How much does PM-KISAN give?', 'What documents for e-Shram card?', 'How to apply for Ayushman Vay Vandana?', 'What can you help with?'],
};

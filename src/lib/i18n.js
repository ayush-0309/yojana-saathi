// UI strings and reply phrasing. Replies only use names and amounts from the seed data.
import { SUBJECTS, inr } from './labels.js';

export const UI = {
  appName: { en: 'Yojana साथी', hi: 'Yojana साथी' },
  tagline: { en: 'Find government schemes by speaking', hi: 'बोलकर सरकारी योजनाएँ खोजें' },
  speak: { en: 'बोलिए (Speak)', hi: 'बोलिए (Speak)' },
  listening: { en: 'Listening… tap to stop', hi: 'सुन रहा हूँ… रोकने के लिए दबाएँ' },
  thinking: { en: 'Thinking…', hi: 'सोच रहा हूँ…' },
  welcome: {
    en: 'Namaste! Tell me about yourself or a family member — your work, where you live and your age. I will tell you which government schemes fit.',
    hi: 'नमस्ते! अपने या परिवार के किसी सदस्य के बारे में बताइए — क्या काम करते हैं, कहाँ रहते हैं, उम्र कितनी है। मैं बताऊँगा कि कौन-सी सरकारी योजनाएँ काम की हैं।',
  },
  trySaying: { en: 'Or tap the mic and say, for example', hi: 'या माइक दबाकर ऐसे बोलिए' },
  whoFor: { en: 'Who are we finding schemes for?', hi: 'किसके लिए योजना ढूँढनी है?' },
  hello: { en: 'Namaste!', hi: 'नमस्ते!' },
  intro: { en: 'Just tell me in your own words what is happening in your life, or what help you need. For example: "I just had a daughter" or "I need help with hospital costs".', hi: 'बस अपने शब्दों में बताइए कि आपके साथ क्या हो रहा है, या कैसी मदद चाहिए। जैसे: "मेरी बेटी हुई है" या "इलाज के लिए मदद चाहिए"।' },
  askAbout: { en: 'Ask about a scheme', hi: 'किसी योजना के बारे में पूछें' },
  browseAll: { en: 'See all schemes', hi: 'सभी योजनाएँ देखें' },
  allSchemes: { en: 'All schemes', hi: 'सभी योजनाएँ' },
  fullDetails: { en: 'See full details', hi: 'पूरी जानकारी देखें' },
  seeAll: { en: 'See all with total', hi: 'सब देखें, कुल रकम के साथ' },
  notNow: { en: 'Not now', hi: 'रहने दें' },
  edit: { en: 'Change', hi: 'बदलें' },
  understoodShort: { en: 'I understood', hi: 'मैंने समझा' },
  browseIntro: { en: 'Every scheme this helper checks. Tap one to see who can get it, documents and how to apply.', hi: 'यह सहायक इन योजनाओं को देखता है। किसी पर दबाकर देखें — किसे मिलेगी, कागज़ और आवेदन कैसे करें।' },
  typeHere: { en: 'Type what you want to say', hi: 'जो कहना है, यहाँ लिखें' },
  send: { en: 'Send', hi: 'भेजें' },
  micUnavailable: { en: 'Microphone is not available here. Tap an example or type below.', hi: 'यहाँ माइक नहीं चल रहा। कोई उदाहरण दबाएँ या नीचे लिखें।' },
  micDenied: { en: 'Microphone permission was blocked. Allow it in the browser, or tap an example.', hi: 'माइक की अनुमति नहीं मिली। ब्राउज़र में अनुमति दें, या कोई उदाहरण दबाएँ।' },
  noSpeech: { en: 'I did not hear anything. Tap the mic and speak again.', hi: 'मुझे कुछ सुनाई नहीं दिया। माइक दबाकर फिर बोलिए।' },
  typeInstead: { en: 'Type instead', hi: 'लिखकर बताएँ' },
  stop: { en: 'Stop', hi: 'रोकें' },
  speaking: { en: 'Speaking…', hi: 'बोल रहा हूँ…' },
  readAloud: { en: 'Read aloud', hi: 'सुनें' },
  save: { en: 'Save', hi: 'सेव करें' },
  saved: { en: 'Saved', hi: 'सेव है' },
  share: { en: 'WhatsApp', hi: 'WhatsApp' },
  back: { en: 'Back', hi: 'वापस' },
  startAgain: { en: 'Start again', hi: 'फिर से शुरू' },
  understood: { en: 'What I understood', hi: 'मैंने यह समझा' },
  tapToChange: { en: 'Tap any item to change it', hi: 'बदलने के लिए किसी पर भी दबाएँ' },
  add: { en: 'Add', hi: 'जोड़ें' },
  seeResults: { en: 'See my schemes', hi: 'मेरी योजनाएँ देखें' },
  dontKnow: { en: "Don't know", hi: 'पता नहीं' },
  done: { en: 'Done', hi: 'ठीक है' },
  whyAsk: { en: 'This changes which schemes fit.', hi: 'इससे पता चलेगा कि कौन-सी योजना सही है।' },
  likely: { en: 'Likely eligible', hi: 'शायद आपको मिल सकती है' },
  checkOne: { en: 'Check one thing', hi: 'एक बात पक्की करें' },
  whyMatch: { en: 'Why it matches', hi: 'क्यों मेल खाती है' },
  assumed: { en: 'assumed', hi: 'मान लिया' },
  notMatched: { en: 'Checked, but not a match', hi: 'देखीं, पर मेल नहीं खातीं' },
  needs: { en: 'Needs', hi: 'शर्त' },
  perYearCash: { en: 'a year in cash', hi: 'हर साल नकद' },
  oneTime: { en: 'one-time', hi: 'एक बार' },
  insuranceCovers: { en: 'insurance covers', hi: 'बीमा सुरक्षा' },
  insuranceCover: { en: 'insurance cover', hi: 'बीमा सुरक्षा' },
  toCheck: { en: 'to check', hi: 'पक्की करनी हैं' },
  noResults: { en: 'No matching scheme yet. Tell me more — your age, work or state.', hi: 'अभी कोई योजना मेल नहीं खाई। थोड़ा और बताइए — उम्र, काम या राज्य।' },
  whoCanGet: { en: 'Who can get it', hi: 'किसे मिल सकती है' },
  notFor: { en: 'Not for', hi: 'इन्हें नहीं' },
  documents: { en: 'Documents to keep ready', hi: 'ये कागज़ तैयार रखें' },
  docsReady: { en: 'ready', hi: 'तैयार' },
  howApply: { en: 'How to apply', hi: 'आवेदन कैसे करें' },
  online: { en: 'Online', hi: 'ऑनलाइन' },
  offline: { en: 'In person', hi: 'ख़ुद जाकर' },
  openSite: { en: 'Open official site', hi: 'सरकारी साइट खोलें' },
  noOnline: { en: 'No online form — apply in person.', hi: 'ऑनलाइन फ़ॉर्म नहीं — ख़ुद जाकर आवेदन करें।' },
  freeNote: {
    en: 'Applying is free. You do not need an agent. Never share your OTP, PIN or bank password with anyone.',
    hi: 'आवेदन मुफ़्त है। किसी एजेंट की ज़रूरत नहीं। अपना OTP, PIN या बैंक पासवर्ड किसी को न बताएँ।',
  },
  markApplied: { en: 'I have applied', hi: 'मैंने आवेदन कर दिया' },
  myApps: { en: 'My schemes', hi: 'मेरी योजनाएँ' },
  callMode: { en: 'Call mode', hi: 'कॉल मोड' },
  home: { en: 'Home', hi: 'होम' },
  footer: { en: 'Independent helper. Confirm on the official portal before applying.', hi: 'स्वतंत्र सहायक। आवेदन से पहले सरकारी पोर्टल पर पक्का करें।' },
  privacy: { en: 'We never ask for your Aadhaar number, OTP or bank details.', hi: 'हम कभी आधार नंबर, OTP या बैंक की जानकारी नहीं माँगते।' },
  demoTracker: { en: 'Demo tracker — saved only on this phone. Not connected to any government system.', hi: 'डेमो ट्रैकर — सिर्फ़ इसी फ़ोन में सेव। किसी सरकारी सिस्टम से जुड़ा नहीं।' },
  emptyApps: { en: 'Nothing saved yet. Save a scheme from its page to track it here.', hi: 'अभी कुछ सेव नहीं है। किसी योजना के पेज से सेव करें, फिर यहाँ ट्रैक करें।' },
  refNo: { en: 'Reference number (optional)', hi: 'आवेदन नंबर (अगर है)' },
  refHint: { en: 'Only the application reference — never Aadhaar or OTP.', hi: 'सिर्फ़ आवेदन नंबर — आधार या OTP नहीं।' },
  status: { en: 'Status', hi: 'स्थिति' },
  nextStep: { en: 'Mark next step', hi: 'अगला चरण' },
  remove: { en: 'Remove', hi: 'हटाएँ' },
  savedOnly: { en: 'Saved — not applied yet', hi: 'सेव है — अभी आवेदन नहीं किया' },
  steps: {
    applied: { en: 'Applied', hi: 'आवेदन किया' },
    verification: { en: 'Verification', hi: 'जाँच' },
    approved: { en: 'Approved', hi: 'मंज़ूर' },
    paid: { en: 'Paid', hi: 'पैसा मिला' },
  },
  call: {
    title: { en: 'Yojana helpline', hi: 'योजना हेल्पलाइन' },
    demo: { en: 'Demo of the phone-call service', hi: 'फ़ोन कॉल सेवा का डेमो' },
    start: { en: 'Start call', hi: 'कॉल शुरू करें' },
    end: { en: 'End call', hi: 'कॉल ख़त्म' },
    mute: { en: 'Mute', hi: 'म्यूट' },
    unmute: { en: 'Unmute', hi: 'अनम्यूट' },
    idle: { en: 'Hands-free: I speak, then I listen. No buttons needed.', hi: 'बिना हाथ लगाए: मैं बोलूँगा, फिर सुनूँगा। कोई बटन नहीं दबाना।' },
    listening: { en: 'Listening…', hi: 'सुन रहा हूँ…' },
    speaking: { en: 'Speaking…', hi: 'बोल रहा हूँ…' },
    ended: { en: 'Call ended', hi: 'कॉल ख़त्म हुई' },
    greet: {
      en: 'Namaste, this is Yojana Saathi. Tell me about yourself: your work, your state and your age.',
      hi: 'नमस्ते, यह योजना साथी है। अपने बारे में बताइए: क्या काम करते हैं, किस राज्य में रहते हैं, और उम्र कितनी है।',
    },
    again: { en: 'You can tell me about another person, or say bye to end the call.', hi: 'आप किसी और के बारे में बता सकते हैं, या कॉल ख़त्म करने के लिए बाय बोलिए।' },
    bye: { en: 'Thank you. Remember, applying is free. Goodbye!', hi: 'धन्यवाद। याद रखिए, आवेदन मुफ़्त है। नमस्ते!' },
    notHeard: { en: 'Sorry, I did not hear you. Please speak now.', hi: 'माफ़ कीजिए, सुनाई नहीं दिया। अब बोलिए।' },
    simulate: { en: 'No microphone? Tap to play the caller:', hi: 'माइक नहीं है? कॉल करने वाले की जगह दबाएँ:' },
    noVoice: { en: 'Call mode needs a browser that can listen (Chrome on Android works best). You can still tap the caller lines below.', hi: 'कॉल मोड के लिए सुनने वाला ब्राउज़र चाहिए (Android पर Chrome सबसे अच्छा)। आप नीचे की लाइनें दबा सकते हैं।' },
  },
};

export const PERSONAS = [
  { id: 'farmer', icon: 'farming', delta: { occupation: 'farmer' }, topics: ['farming'], en: 'Farmer', hi: 'किसान', sub: { en: 'I grow crops', hi: 'खेती करते हैं' } },
  { id: 'elder', icon: 'elder', delta: { age: { min: 60, max: 110 } }, topics: ['elder'], en: 'Elderly', hi: 'बुज़ुर्ग', sub: { en: '60 years or older', hi: '60 साल या ज़्यादा' } },
  { id: 'worker', icon: 'worker', delta: { occupation: 'labourer' }, topics: ['worker'], en: 'Worker', hi: 'मज़दूर', sub: { en: 'Daily wage, building, domestic work', hi: 'दिहाड़ी, निर्माण, घरेलू काम' } },
  { id: 'mother', icon: 'mother', delta: { pregnant: true, gender: 'female' }, en: 'Pregnant woman', hi: 'गर्भवती महिला', sub: { en: 'Expecting a baby', hi: 'माँ बनने वाली' } },
  { id: 'daughter', icon: 'savings', delta: { hasDaughter: true }, topics: ['girl'], en: 'For a daughter', hi: 'बेटी के लिए', sub: { en: 'Savings for her future', hi: 'बेटी के भविष्य की योजना' } },
  { id: 'health', icon: 'health', delta: {}, topics: ['health', 'insurance'], en: 'Treatment & insurance', hi: 'इलाज और बीमा', sub: { en: 'Hospital, accident, life cover', hi: 'अस्पताल, दुर्घटना, जीवन बीमा' } },
];

export const t = (key, lang) => {
  const v = key.split('.').reduce((o, k) => o?.[k], UI);
  return v ? v[lang] ?? v.en : key;
};

export const EXAMPLES = {
  hi: [
    'मैं हरियाणा का किसान हूँ, मेरे पास दो एकड़ ज़मीन है',
    'Meri maa 72 saal ki hain, Rohtak, Haryana mein rehti hain, koi income nahi',
    'मैं 28 साल का हूँ, बिहार से हूँ, दिल्ली में कंस्ट्रक्शन का काम करता हूँ, महीने के 12,000 कमाता हूँ',
    'मैं पहली बार माँ बनने वाली हूँ',
  ],
  en: [
    'I am a farmer from Haryana, I have two acres of land',
    'Meri maa 72 saal ki hain, Rohtak, Haryana mein rehti hain, koi income nahi',
    'I am 28, a construction worker from Bihar in Delhi, earning 12,000 a month',
    'I am going to be a mother for the first time',
  ],
};

// ---------- reply builders ----------
const subj = (p) => SUBJECTS[p.subject || 'self'];

export function questionText(field, p, lang) {
  const s = subj(p);
  const self = !p.subject || p.subject === 'self';
  switch (field) {
    case 'age':
      if (lang === 'hi') return self ? 'आपकी उम्र कितनी है?' : `${s.rel.hi} की उम्र कितनी है?`;
      return self ? 'How old are you?' : `How old is your ${s.rel.en}?`;
    case 'incomeMonthly':
      if (lang === 'hi') return self ? 'महीने में लगभग कितना कमाते हैं?' : 'परिवार की महीने की कमाई लगभग कितनी है?';
      return self ? 'About how much do you earn in a month?' : 'About how much does the family earn in a month?';
    case 'childOrder':
      return lang === 'hi' ? 'क्या यह आपका पहला बच्चा है?' : 'Is this your first baby?';
    case 'hasLand':
      return lang === 'hi' ? 'क्या खेती की ज़मीन आपके परिवार के नाम है?' : "Is the farm land in your family's name?";
    default:
      return '';
  }
}

export function sorryAnswer(field, p, lang) {
  return (lang === 'hi' ? 'माफ़ कीजिए, समझ नहीं पाया। ' : 'Sorry, I did not catch that. ') + questionText(field, p, lang);
}

export function notUnderstood(lang) {
  return lang === 'hi'
    ? 'माफ़ कीजिए, मैं समझ नहीं पाया। अपना काम, राज्य और उम्र बताइए — जैसे "मैं बिहार का किसान हूँ, 45 साल का"।'
    : 'Sorry, I did not understand. Tell me your work, state and age — for example "I am a farmer from Bihar, 45 years old".';
}

const joinList = (items, lang) => {
  if (items.length <= 1) return items.join('');
  const and = lang === 'hi' ? ' और ' : ' and ';
  return items.slice(0, -1).join(', ') + and + items[items.length - 1];
};

export function moneyLine(sum, lang) {
  const parts = [];
  if (sum.cashYearly) parts.push(lang === 'hi' ? `हर साल ${inr(sum.cashYearly)} नकद` : `${inr(sum.cashYearly)} a year in cash`);
  if (sum.oneTime) parts.push(lang === 'hi' ? `एक बार ${inr(sum.oneTime)}` : `${inr(sum.oneTime)} one-time`);
  if (sum.insurance) parts.push(lang === 'hi' ? `${sum.insurance} बीमा सुरक्षा` : `${sum.insurance} insurance cover${sum.insurance > 1 ? 's' : ''}`);
  return joinList(parts, lang);
}

export function resultsReply(sum, p, lang) {
  const self = !p.subject || p.subject === 'self';
  const n = sum.eligible.length;
  const c = sum.check.length;
  if (!n && !c) return { text: t('noResults', lang), speech: t('noResults', lang) };
  const titles = sum.eligible.map((r) => r.scheme.title[lang]);
  const money = moneyLine(sum, lang);
  let text;
  if (lang === 'hi') {
    const forWho = self ? '' : `${subj(p).rel.hi} के लिए `;
    text = n
      ? `${forWho}${n} योजना${n > 1 ? 'एँ' : ''} शायद मिल सकती ${n > 1 ? 'हैं' : 'है'}: ${joinList(titles, lang)}।` + (money ? ` कुल मिलाकर: ${money}।` : '')
      : `${forWho}कोई योजना पक्की नहीं हुई।`;
    if (c) text += ` ${c} योजना${c > 1 ? 'ओं' : ''} में एक बात पक्की करनी है।`;
    text += ' आवेदन मुफ़्त है, किसी एजेंट की ज़रूरत नहीं।';
  } else {
    const forWho = self ? '' : `For your ${subj(p).rel.en}, `;
    text = n
      ? `${forWho}${n} scheme${n > 1 ? 's are' : ' is'} likely a match: ${joinList(titles, lang)}.` + (money ? ` Together: ${money}.` : '')
      : `${forWho}no scheme is confirmed yet.`;
    if (c) text += ` ${c} more need${c > 1 ? '' : 's'} one thing checked.`;
    text += ' Applying is free — you do not need an agent.';
  }
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return { text, speech: text };
}

/** Longer spoken list for call mode. */
export function callResultsSpeech(sum, p, lang) {
  const n = sum.eligible.length;
  if (!n && !sum.check.length) return t('noResults', lang);
  const money = moneyLine(sum, lang);
  const head = lang === 'hi'
    ? `${n} योजना${n === 1 ? '' : 'एँ'} शायद मिल सकती ${n === 1 ? 'है' : 'हैं'}${money ? `, कुल ${money}` : ''}।`
    : `${n} scheme${n === 1 ? ' is' : 's are'} likely a match${money ? `, worth ${money}` : ''}.`;
  const ord = lang === 'hi' ? ['पहली', 'दूसरी', 'तीसरी', 'चौथी', 'पाँचवीं', 'छठी', 'सातवीं'] : ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];
  const lines = sum.eligible.map((r, i) => `${ord[i] || i + 1}: ${r.scheme.title[lang]}, ${r.benefit.spoken[lang]}.`);
  const checks = sum.check.map((r) => `${r.scheme.title[lang]}: ${r.checks[0].check[lang]}`);
  const checkHead = lang === 'hi' ? 'एक बात पक्की करनी है — ' : 'One thing to check — ';
  const free = lang === 'hi' ? 'आवेदन मुफ़्त है, किसी एजेंट की ज़रूरत नहीं।' : 'Applying is free; you do not need an agent.';
  return [head, ...lines, checks.length ? checkHead + checks.join('. ') + '.' : '', free].filter(Boolean).join(' ');
}

// ---------- conversational replies ----------
export const AGE_CHOICES = [
  { value: { min: 1, max: 17 }, en: 'Below 18', hi: '18 से कम' },
  { value: { min: 18, max: 40 }, en: '18 – 40', hi: '18 – 40' },
  { value: { min: 41, max: 50 }, en: '41 – 50', hi: '41 – 50' },
  { value: { min: 51, max: 59 }, en: '51 – 59', hi: '51 – 59' },
  { value: { min: 60, max: 69 }, en: '60 – 69', hi: '60 – 69' },
  { value: { min: 70, max: 110 }, en: '70 or more', hi: '70 या ज़्यादा' },
];

export function openerText(p, lang) {
  if (p.recentBirth && p.girlChild) return lang === 'hi' ? 'बेटी के जन्म की बहुत बधाई!' : 'Congratulations on your daughter!';
  if (p.recentBirth) return lang === 'hi' ? 'नए बच्चे की बहुत बधाई!' : 'Congratulations on the new baby!';
  if (p.pregnant) return lang === 'hi' ? 'बधाई हो!' : 'Congratulations!';
  return '';
}

/** Gentle, optional follow-up: says why, never blocks. */
export function softAsk(field, p, lang) {
  const why = {
    age: { en: 'insurance and pension schemes depend on it', hi: 'बीमा और पेंशन की योजनाएँ इसी से तय होती हैं' },
    childOrder: { en: 'the amount depends on it', hi: 'पैसा इसी से तय होता है' },
    incomeMonthly: { en: 'some schemes have an income limit', hi: 'कुछ योजनाओं में कमाई की सीमा है' },
    hasLand: { en: 'PM-KISAN needs land in the family name', hi: 'पीएम-किसान के लिए परिवार के नाम ज़मीन चाहिए' },
  }[field];
  const q = questionText(field, p, lang);
  return lang === 'hi' ? `अगर बताना चाहें: ${q} (${why.hi})` : `If you like, tell me: ${q} (${why.en})`;
}

export function conversationalReply(sum, p, lang) {
  const self = !p.subject || p.subject === 'self';
  const n = sum.eligible.length;
  const c = sum.check.length;
  const opener = openerText(p, lang);
  const forWho = self ? '' : lang === 'hi' ? `${subj(p).rel.hi} के लिए: ` : `For your ${subj(p).rel.en}: `;
  const top = [...sum.eligible, ...sum.check].slice(0, 4);
  const spokenList = top.map((r) => `${r.scheme.title[lang]} — ${r.benefit.spoken[lang]}`).join('. ');
  const money = moneyLine(sum, lang);
  let text;
  let speech;
  if (!n && !c) {
    text = lang === 'hi'
      ? 'मेरी सूची की कोई योजना अभी मेल नहीं खाई। थोड़ा और बताइए — जैसे आप क्या काम करते हैं, किस राज्य में रहते हैं, या किस चीज़ में मदद चाहिए (बीमा, पेंशन, इलाज, बेटी, खेती)।'
      : 'No scheme from my list fits yet. Tell me a little more — your work, your state, or what you need help with (insurance, pension, treatment, daughter, farming).';
    speech = text;
  } else if (lang === 'hi') {
    text = `${opener ? opener + ' ' : ''}${forWho}ये योजनाएँ काम आ सकती हैं:`;
    if (money && n) text += ` (कुल ${money})`;
    speech = `${opener ? opener + ' ' : ''}${forWho}${spokenList}।${c ? ' कुछ में एक बात पक्की करनी है।' : ''} आवेदन मुफ़्त है।`;
  } else {
    text = `${opener ? opener + ' ' : ''}${forWho}These schemes can help:`;
    if (money && n) text += ` (together ${money})`;
    speech = `${opener ? opener + ' ' : ''}${forWho}${spokenList}.${c ? ' Some need one thing checked.' : ''} Applying is free.`;
  }
  return { text, speech };
}

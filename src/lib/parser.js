// Rule-based profile extractor for Hindi (Devanagari), Hinglish and English.
// Input: what the person said. Output: a partial profile with only the details found.

// ---------- normalisation ----------
export function norm(s) {
  let t = String(s || '').normalize('NFC').toLowerCase();
  t = t.replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));
  t = t.replace(/़/g, '').replace(/ँ/g, 'ं'); // drop nukta, chandrabindu → anusvara
  t = t.replace(/(\d),(?=\d)/g, '$1');
  t = t.replace(/₹\s*/g, ' rs ');
  t = t.replace(/(\d)\s*k\b/g, '$1000');
  t = t.replace(/[’']/g, ' ');
  t = t.replace(/[^\p{L}\p{M}\p{N}.\s]/gu, ' ');
  t = t.replace(/(?<!\d)\.|\.(?!\d)/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

const N = (list) => list.map(norm);

// ---------- numbers ----------
const HI_NUMS = 'एक दो तीन चार पांच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस उनचास पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उन्यासी अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी नब्बे इक्यानवे बानवे तिरानवे चौरानवे पचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे'.split(' ');
const ROMAN_NUMS = 'ek do teen char paanch chhah saat aath nau das gyarah barah terah chaudah pandrah solah satrah atharah unnis bees ikkis bais teis chaubis pachchis chhabbis sattais atthais untis tees iktis battis taintis chauntis paintis chhattis saintis adtis untalis chalis iktalis bayalis taintalis chavalis paintalis chhiyalis saintalis adtalis unchas pachas ikyavan bavan tirpan chauvan pachpan chhappan sattavan atthavan unsath saath iksath basath tirsath chausath painsath chhiyasath sadsath adsath unhattar sattar ikhattar bahattar tihattar chauhattar pachhattar chhihattar satattar athattar unyasi assi ikyasi bayasi tirasi chaurasi pachasi chhiyasi sattasi atthasi navasi nabbe ikyanve banve tiranve chauranve pachanve chhiyanve sattanve atthanve ninyanve'.split(' ');
const ROMAN_ALT = {
  chaar: 4, panch: 5, chhe: 6, che: 6, chah: 6, chhai: 6, gyara: 11, baarah: 12, baara: 12, pandrah: 15, pachis: 25,
  athais: 28, chaalis: 40, pachaas: 50, sath: 60, behattar: 72, bahattar: 72, baahattar: 72, pachattar: 75, nabbe: 90,
};
const EN_ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const EN_TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MULT = { hundred: 100, sau: 100, सौ: 100, thousand: 1000, hazar: 1000, hazaar: 1000, hajar: 1000, hajaar: 1000, हजार: 1000, lakh: 1e5, lakhs: 1e5, lac: 1e5, lacs: 1e5, लाख: 1e5, crore: 1e7, करोड: 1e7 };
const FRACT = { dedh: 1.5, डेढ: 1.5, dhai: 2.5, ढाई: 2.5 };
const PLUS_HALF = new Set(['saadhe', 'sadhe', 'साढे']);

const WORD_NUM = new Map();
HI_NUMS.forEach((w, i) => WORD_NUM.set(norm(w), i + 1));
WORD_NUM.set(norm('छः'), 6); WORD_NUM.set(norm('छे'), 6);
ROMAN_NUMS.forEach((w, i) => WORD_NUM.set(w, i + 1));
Object.entries(ROMAN_ALT).forEach(([w, n]) => WORD_NUM.set(w, n));
EN_ONES.forEach((w, i) => WORD_NUM.set(w, i));
Object.entries(EN_TENS).forEach(([w, n]) => WORD_NUM.set(w, n));
// Words that are also ordinary words; only numbers when a unit follows.
const AMBIGUOUS = new Set(['do', 'saath', 'sath', 'che', 'chhe', 'nau', 'ek', 'das', 'teen', 'bees', 'sau', 'zero', 'one']);

const AGE_UNITS = new Set(N(['saal', 'sal', 'साल', 'years', 'year', 'yrs', 'yr', 'वर्ष', 'बरस', 'baras', 'varsh', 'yo']));
const LAND_UNITS = {
  acre: 1, acres: 1, ekad: 1, ekar: 1, ekadh: 1, ekkar: 1, [norm('एकड़')]: 1, [norm('एकर')]: 1,
  killa: 1, kila: 1, kille: 1, [norm('किल्ला')]: 1, [norm('किला')]: 1, [norm('किल्ले')]: 1,
  hectare: 2.471, hectares: 2.471, [norm('हेक्टेयर')]: 2.471,
  kanal: 0.125, [norm('कनाल')]: 0.125,
  bigha: 'bigha', [norm('बीघा')]: 'bigha', [norm('बीघे')]: 'bigha',
};
const MONEY_WORDS = new Set(N([
  'rs', 'rupees', 'rupee', 'rupaye', 'rupay', 'rupiya', 'रुपये', 'रुपए', 'रुपया', 'earn', 'earning', 'earns', 'earned',
  'kamata', 'kamati', 'kamate', 'kamai', 'kamaata', 'कमाता', 'कमाती', 'कमाते', 'कमाई', 'income', 'इनकम', 'आय', 'आमदनी', 'aamdani',
  'amdani', 'salary', 'सैलरी', 'तनख्वाह', 'tankhwah', 'वेतन', 'vetan', 'milte', 'मिलते', 'milta', 'मिलता', 'paise', 'पैसे', 'make', 'makes',
]));
const MONTH_WORDS = new Set(N(['month', 'monthly', 'months', 'mahina', 'mahine', 'maheena', 'maheene', 'mahinay', 'महीना', 'महीने', 'मासिक', 'pm']));
const YEAR_WORDS = new Set(N(['year', 'yearly', 'annual', 'annually', 'saal', 'sal', 'साल', 'सालाना', 'salana', 'वार्षिक', 'varshik', 'pa']));

function readNumberAt(tokens, i, allowAmbiguous) {
  const tok = tokens[i];
  let val = null;
  let used = 1;
  if (/^\d+(\.\d+)?$/.test(tok)) val = parseFloat(tok);
  else if (FRACT[tok] !== undefined) val = FRACT[tok];
  else if (PLUS_HALF.has(tok) && tokens[i + 1]) {
    const inner = readNumberAt(tokens, i + 1, true);
    if (inner && inner.val < 100) { val = inner.val + 0.5; used = 1 + inner.used; }
  } else if (WORD_NUM.has(tok)) {
    val = WORD_NUM.get(tok);
    if (EN_TENS[tok] && EN_ONES.indexOf(tokens[i + 1]) > 0 && EN_ONES.indexOf(tokens[i + 1]) < 10) {
      val += EN_ONES.indexOf(tokens[i + 1]); used = 2;
    }
    if (AMBIGUOUS.has(tok) && !allowAmbiguous) {
      const next = tokens[i + used];
      const isUnit = next && (MULT[next] || AGE_UNITS.has(next) || LAND_UNITS[next] !== undefined || MONEY_WORDS.has(next));
      if (!isUnit) return null;
    }
  }
  if (val === null) return null;
  while (tokens[i + used] && MULT[tokens[i + used]]) { val *= MULT[tokens[i + used]]; used += 1; }
  return { val, used };
}

/** Replace number words with digits. */
export function numberise(tokens, allowAmbiguous = false) {
  const out = [];
  for (let i = 0; i < tokens.length;) {
    const n = readNumberAt(tokens, i, allowAmbiguous);
    if (n) { out.push(String(Math.round(n.val * 1000) / 1000)); i += n.used; } else { out.push(tokens[i]); i += 1; }
  }
  return out;
}

// ---------- phrase helpers ----------
const pad = (tokens) => ` ${tokens.join(' ')} `;
/** Token index where phrase starts (prefix match on the last word), or -1. */
function findPhrase(tokens, phrase, whole = false) {
  const p = phrase.split(' ');
  outer: for (let i = 0; i <= tokens.length - p.length; i++) {
    for (let j = 0; j < p.length; j++) {
      const t = tokens[i + j];
      const last = j === p.length - 1;
      if (last && !whole ? !t.startsWith(p[j]) : t !== p[j]) continue outer;
    }
    return i;
  }
  return -1;
}
function findAny(tokens, phrases, whole = false) {
  for (const ph of phrases) {
    const i = findPhrase(tokens, ph, whole);
    if (i >= 0) return { i, len: ph.split(' ').length, ph };
  }
  return null;
}
const NEG_AFTER = new Set(N(['nahi', 'nahin', 'nai', 'नहीं', 'नही', 'na', 'not']));
const NEG_BEFORE = new Set(N(['no', 'not', 'don', 'dont', 'never', 'without', 'bina', 'बिना', 'doesn', 'didn', 'koi']));
function negated(tokens, hit) {
  const after = tokens.slice(hit.i + hit.len, hit.i + hit.len + 3);
  const before = tokens.slice(Math.max(0, hit.i - 3), hit.i);
  if (after.some((t) => NEG_AFTER.has(t))) return true;
  // "koi X nahi" handled by after; plain "koi" before without nahi is not negation
  return before.some((t) => NEG_BEFORE.has(t) && t !== 'koi');
}

// ---------- places ----------
const STATE_ALIASES = {
  andhra_pradesh: ['andhra pradesh', 'andhra', 'आंध्र प्रदेश', 'आंध्र'],
  arunachal_pradesh: ['arunachal', 'अरुणाचल'],
  assam: ['assam', 'असम'],
  bihar: ['bihar', 'बिहार'],
  chhattisgarh: ['chhattisgarh', 'chattisgarh', 'छत्तीसगढ़'],
  goa: ['goa', 'गोवा'],
  gujarat: ['gujarat', 'गुजरात'],
  haryana: ['haryana', 'hariyana', 'हरियाणा', 'हरयाणा'],
  himachal_pradesh: ['himachal', 'हिमाचल'],
  jharkhand: ['jharkhand', 'झारखंड', 'झारखण्ड'],
  karnataka: ['karnataka', 'कर्नाटक'],
  kerala: ['kerala', 'केरल'],
  madhya_pradesh: ['madhya pradesh', 'मध्य प्रदेश', 'मध्यप्रदेश'],
  maharashtra: ['maharashtra', 'महाराष्ट्र'],
  manipur: ['manipur', 'मणिपुर'],
  meghalaya: ['meghalaya', 'मेघालय'],
  mizoram: ['mizoram', 'मिज़ोरम'],
  nagaland: ['nagaland', 'नागालैंड'],
  odisha: ['odisha', 'orissa', 'ओडिशा', 'उड़ीसा'],
  punjab: ['punjab', 'पंजाब'],
  rajasthan: ['rajasthan', 'राजस्थान'],
  sikkim: ['sikkim', 'सिक्किम'],
  tamil_nadu: ['tamil nadu', 'tamilnadu', 'तमिलनाडु', 'तमिल नाडु'],
  telangana: ['telangana', 'तेलंगाना'],
  tripura: ['tripura', 'त्रिपुरा'],
  uttar_pradesh: ['uttar pradesh', 'उत्तर प्रदेश', 'यूपी'],
  uttarakhand: ['uttarakhand', 'उत्तराखंड', 'उत्तराखण्ड'],
  west_bengal: ['west bengal', 'bengal', 'पश्चिम बंगाल', 'बंगाल'],
  delhi: ['delhi', 'dilli', 'दिल्ली', 'new delhi'],
  jammu_kashmir: ['jammu', 'kashmir', 'जम्मू', 'कश्मीर'],
  ladakh: ['ladakh', 'लद्दाख'],
  chandigarh: ['chandigarh', 'चंडीगढ़'],
  puducherry: ['puducherry', 'pondicherry', 'पुडुचेरी'],
};
const CITIES = {
  haryana: { rohtak: 'रोहतक', hisar: 'हिसार', hissar: 'हिसार', karnal: 'करनाल', panipat: 'पानीपत', sonipat: 'सोनीपत', gurgaon: 'गुड़गांव', gurugram: 'गुरुग्राम', faridabad: 'फरीदाबाद', ambala: 'अंबाला', jind: 'जींद', bhiwani: 'भिवानी', sirsa: 'सिरसा', kaithal: 'कैथल', kurukshetra: 'कुरुक्षेत्र', rewari: 'रेवाड़ी', jhajjar: 'झज्जर', yamunanagar: 'यमुनानगर' },
  bihar: { patna: 'पटना', muzaffarpur: 'मुजफ्फरपुर', darbhanga: 'दरभंगा', bhagalpur: 'भागलपुर', purnia: 'पूर्णिया', siwan: 'सीवान', chhapra: 'छपरा', madhubani: 'मधुबनी' },
  uttar_pradesh: { lucknow: 'लखनऊ', kanpur: 'कानपुर', varanasi: 'वाराणसी', agra: 'आगरा', prayagraj: 'प्रयागराज', gorakhpur: 'गोरखपुर', meerut: 'मेरठ', noida: 'नोएडा', ghaziabad: 'गाजियाबाद' },
  rajasthan: { jaipur: 'जयपुर', jodhpur: 'जोधपुर', udaipur: 'उदयपुर', kota: 'कोटा', bikaner: 'बीकानेर' },
  punjab: { ludhiana: 'लुधियाना', amritsar: 'अमृतसर', jalandhar: 'जालंधर', patiala: 'पटियाला' },
  maharashtra: { mumbai: 'मुंबई', pune: 'पुणे', nagpur: 'नागपुर', nashik: 'नासिक' },
  west_bengal: { kolkata: 'कोलकाता' },
  madhya_pradesh: { bhopal: 'भोपाल', indore: 'इंदौर', gwalior: 'ग्वालियर', jabalpur: 'जबलपुर' },
  jharkhand: { ranchi: 'रांची', dhanbad: 'धनबाद', jamshedpur: 'जमशेदपुर' },
  gujarat: { ahmedabad: 'अहमदाबाद', surat: 'सूरत' },
};
const PLACE_INDEX = []; // { tokens, state, city? }
for (const [code, list] of Object.entries(STATE_ALIASES)) for (const a of list) PLACE_INDEX.push({ ph: norm(a), state: code });
for (const [code, cities] of Object.entries(CITIES)) {
  for (const [en, hi] of Object.entries(cities)) {
    const city = en.charAt(0).toUpperCase() + en.slice(1);
    PLACE_INDEX.push({ ph: en, state: code, city: { en: city, hi } });
    PLACE_INDEX.push({ ph: norm(hi), state: code, city: { en: city, hi } });
  }
}
PLACE_INDEX.sort((a, b) => b.ph.length - a.ph.length);

const HOME_BEFORE = new Set(N(['from', 'frm', 'native', 'ghar', 'घर', 'gaon', 'gaanv', 'गांव', 'village', 'hometown']));
const CUR_BEFORE = new Set(N(['in', 'at', 'inside']));
const HOME_AFTER = new Set(N(['से', 'se', 'ka', 'ki', 'ke', 'का', 'की', 'के', 'wala', 'wali', 'वाला', 'वाली']));
const CUR_AFTER = new Set(N(['में', 'मे', 'mein', 'me', 'main', 'mai', 'mei']));

function findPlaces(tokens) {
  const mentions = [];
  const taken = new Set();
  for (const p of PLACE_INDEX) {
    const pt = p.ph.split(' ');
    for (let i = 0; i <= tokens.length - pt.length; i++) {
      if (pt.every((w, j) => tokens[i + j] === w) && !pt.some((_, j) => taken.has(i + j))) {
        pt.forEach((_, j) => taken.add(i + j));
        const before = tokens[i - 1];
        const after = tokens[i + pt.length];
        // "Rohtak, Haryana mein" — the role word can follow the next place name
        const after2 = tokens[i + pt.length + 1];
        let role = null;
        if (HOME_BEFORE.has(before) || HOME_AFTER.has(after)) role = 'home';
        else if (CUR_BEFORE.has(before) || CUR_AFTER.has(after) || CUR_AFTER.has(after2)) role = 'current';
        mentions.push({ i, state: p.state, city: p.city, role });
      }
    }
  }
  return mentions.sort((a, b) => a.i - b.i);
}

// ---------- vocabulary ----------
const OCCUPATIONS = [
  ['agri_labourer', ['khet mazdoor', 'khet majdoor', 'खेत मजदूर', 'खेतिहर', 'khetihar', 'farm labourer', 'farm labour', 'farm worker', 'agricultural labourer', 'agricultural worker', 'agricultural labour']],
  ['construction_worker', ['construction', 'कंस्ट्रक्शन', 'कन्स्ट्रक्शन', 'निर्माण', 'nirman', 'raj mistri', 'rajmistri', 'राजमिस्त्री', 'राज मिस्त्री', 'mistri', 'मिस्त्री', 'beldar', 'बेलदार', 'mason', 'site par', 'साइट पर', 'building']],
  ['domestic_worker', ['domestic worker', 'domestic help', 'maid', 'kaamwali', 'kamwali', 'कामवाली', 'घरेलू कामगार', 'gharelu kaam', 'house help', 'logon ke ghar']],
  ['street_vendor', ['street vendor', 'vendor', 'hawker', 'thela', 'ठेला', 'rehri', 'rehdi', 'रेहड़ी', 'फेरी', 'pheri', 'sabzi bech', 'sabji bech', 'सब्जी बेच', 'रेहड़ी पटरी']],
  ['driver', ['driver', 'ड्राइवर', 'rickshaw', 'रिक्शा', 'auto chala', 'ऑटो चला', 'chalak', 'चालक']],
  ['artisan', ['carpenter', 'बढ़ई', 'badhai', 'plumber', 'प्लंबर', 'electrician', 'इलेक्ट्रीशियन', 'painter', 'पेंटर', 'tailor', 'darzi', 'दर्जी', 'weaver', 'बुनकर', 'bunkar', 'cobbler', 'mochi', 'मोची', 'barber', 'नाई', 'dhobi', 'धोबी', 'potter', 'kumhar', 'कुम्हार', 'security guard', 'guard', 'गार्ड', 'delivery', 'डिलीवरी']],
  ['labourer', ['mazdoor', 'majdoor', 'mazdur', 'majdur', 'मजदूर', 'मजदूरी', 'mazdoori', 'labour', 'labourer', 'laborer', 'worker', 'dihadi', 'दिहाड़ी', 'daily wage', 'shramik', 'श्रमिक', 'kamgar', 'कामगार', 'hammal', 'पल्लेदार', 'coolie', 'कुली']],
  ['farmer', ['किसान', 'kisan', 'kisaan', 'farmer', 'farming', 'kheti', 'खेती', 'krishak', 'कृषक', 'agriculture']],
  ['homemaker', ['housewife', 'homemaker', 'गृहिणी', 'grihini', 'grehni', 'house wife', 'ghar sambhal', 'घर संभाल']],
  ['salaried', ['government job', 'sarkari naukri', 'सरकारी नौकरी', 'govt job', 'teacher', 'टीचर', 'clerk', 'office job']],
  ['student', ['student', 'छात्र', 'छात्रा', 'chhatra', 'padhai karta', 'padhai karti', 'पढ़ाई करता', 'पढ़ाई करती']],
  ['unemployed', ['unemployed', 'berozgar', 'बेरोजगार', 'no job', 'koi kaam nahi', 'कोई काम नहीं']],
].map(([code, list]) => [code, N(list)]);

const SUBJECTS = [
  ['mother', ['मेरी मां', 'meri maa', 'meri ma', 'meri mummy', 'meri mata', 'मेरी माता', 'my mother', 'my mom', 'my mum', 'my mummy', 'mummy', 'मम्मी', 'माताजी', 'mata ji', 'mataji', 'maa ji', 'मां जी']],
  ['father', ['मेरे पिता', 'मेरे पापा', 'पिताजी', 'mere pita', 'mere papa', 'my father', 'my dad', 'pitaji', 'papa ji', 'बाबूजी', 'babuji']],
  ['grandmother', ['मेरी दादी', 'मेरी नानी', 'meri dadi', 'meri nani', 'my grandmother', 'my grandma', 'my granny', 'dadi ji', 'nani ji', 'दादी जी', 'नानी जी']],
  ['grandfather', ['मेरे दादा', 'मेरे नाना', 'mere dada', 'mere nana', 'my grandfather', 'my grandpa', 'dada ji', 'nana ji', 'दादाजी', 'नानाजी', 'दादा जी', 'नाना जी']],
  ['wife', ['मेरी पत्नी', 'मेरी बीवी', 'meri patni', 'meri biwi', 'meri wife', 'my wife']],
  ['husband', ['मेरे पति', 'mere pati', 'mere husband', 'my husband']],
].map(([code, list]) => [code, N(list)]);
const SUBJECT_GENDER = { mother: 'female', grandmother: 'female', wife: 'female', father: 'male', grandfather: 'male', husband: 'male' };

const WIDOW = N(['विधवा', 'vidhwa', 'vidhva', 'widow', 'widowed', 'पति नहीं रहे', 'pati nahi rahe', 'pati ki maut', 'पति की मौत', 'पति की मृत्यु', 'husband died', 'husband passed', 'lost my husband', 'husband is no more']);
const PREGNANT = N(['गर्भवती', 'गर्भ', 'garbhvati', 'garbhwati', 'pregnant', 'expecting', 'मां बनने', 'मां बनूंगी', 'maa banne', 'ma banne', 'maa banungi', 'be a mother', 'become a mother', 'becoming a mother', 'बच्चा होने', 'baby hone', 'bachcha hone', 'bachha hone', 'baccha hone', 'having a baby', 'baby due', 'बच्चा आने', 'pet se']);
const CHILD_1 = N(['पहली बार', 'pehli baar', 'pehli bar', 'pahli baar', 'pahli bar', 'first time', 'first child', 'first baby', 'first pregnancy', 'पहला बच्चा', 'pehla bachcha', 'pahla bachcha', 'pehla baccha', 'पहली संतान']);
const CHILD_2 = N(['दूसरी बार', 'dusri baar', 'doosri baar', 'dusri bar', 'दूसरा बच्चा', 'dusra bachcha', 'doosra bachcha', 'dusra baccha', 'second child', 'second baby', 'second time', 'second pregnancy', 'दूसरी संतान']);
const CHILD_3 = N(['तीसरा बच्चा', 'तीसरी बार', 'teesra bachcha', 'teesri baar', 'third child', 'third baby', 'third time']);
const MIGRANT = N(['migrant', 'प्रवासी', 'pravasi', 'pravaasi', 'दूसरे राज्य', 'doosre rajya', 'dusre rajya', 'other state', 'another state', 'outside my state']);
const FEMALE = N(['महिला', 'औरत', 'aurat', 'mahila', 'woman', 'lady', 'female', 'स्त्री', 'girl', 'लड़की', 'ladki']);
const MALE = N(['आदमी', 'aadmi', 'purush', 'पुरुष', 'male', 'man', 'लड़का', 'ladka', 'boy']);
const RATION = N(['ration card', 'राशन कार्ड', 'rashan card', 'ration']);
const EPF = N(['epf', 'pf', 'पीएफ', 'esic', 'esi', 'provident fund']);
const TAX = N(['income tax', 'इनकम टैक्स', 'आयकर', 'tax', 'टैक्स']);
const ZERO_INCOME = N(['koi income nahi', 'koi income nahin', 'income nahi', 'income nahin', 'no income', 'zero income', 'कोई आमदनी नहीं', 'कोई आय नहीं', 'कोई इनकम नहीं', 'कोई कमाई नहीं', 'इनकम नहीं', 'आमदनी नहीं', 'आय नहीं', 'कमाई नहीं', 'koi kamai nahi', 'kamai nahi', 'kuch nahi kamate', 'kuch nahi kamati', 'kuch nahi kamata', 'not earning', 'no earnings', 'does not earn', 'doesn t earn', 'don t earn', 'do not earn', 'koi aamdani nahi', 'aamdani nahi']);
const LAND_YES = N(['जमीन', 'zameen', 'zamin', 'jameen', 'jamin', 'land', 'khet hai', 'खेत है', 'apna khet', 'अपना खेत']);
const LAND_NO = N(['landless', 'भूमिहीन', 'bhumihin', 'bhoomiheen']);
const AGE_BEFORE = new Set(N(['age', 'aged', 'umar', 'umr', 'उम्र', 'उमर', 'aayu', 'आयु', 'am', 'is', 'im']));
const DURATION_AFTER = new Set(N(['से', 'se', 'from', 'pehle', 'पहले', 'ago', 'tak', 'तक', 'since']));
const DURATION_BEFORE = new Set(N(['for', 'since', 'pichhle', 'पिछले', 'last']));
const KA_KI = new Set(N(['ka', 'ki', 'ke', 'का', 'की', 'के']));
const HOON = new Set(N(['hoon', 'hun', 'hu', 'hoo', 'हूं', 'हैं', 'hain', 'hai', 'है']));

export const YES = N(['haan', 'han', 'haa', 'ha', 'हां', 'हा', 'ji', 'जी', 'yes', 'yeah', 'yep', 'sure', 'bilkul', 'बिल्कुल', 'hai', 'है', 'correct', 'sahi', 'सही']);
export const NO = N(['nahi', 'nahin', 'nai', 'नहीं', 'नही', 'no', 'nope', 'na', 'ना']);
const SKIP = N(['pata nahi', 'पता नहीं', 'pata nahin', 'don t know', 'dont know', 'do not know', 'not sure', 'skip', 'छोड़ो', 'chhodo', 'maloom nahi', 'मालूम नहीं', 'malum nahi', 'nahi pata', 'नहीं पता', 'no idea']);
export const END_CALL = N(['bye', 'goodbye', 'good bye', 'बाय', 'alvida', 'अलविदा', 'band karo', 'बंद करो', 'call band', 'end call', 'stop call', 'bas', 'बस', 'dhanyavad', 'धन्यवाद', 'thank you', 'thanks', 'shukriya', 'शुक्रिया']);

// ---------- main extractor ----------
export function parseUtterance(text, opts = {}) {
  const raw = norm(text);
  if (!raw) return {};
  let tokens = numberise(raw.split(' '), opts.allowAmbiguous);
  const p = {};
  const used = new Set(); // token indices consumed by a number reading

  // subject (who we are talking about)
  const widowHit = findAny(tokens, WIDOW);
  if (widowHit) { p.widow = true; p.gender = 'female'; }
  for (const [code, list] of SUBJECTS) {
    if (code === 'husband' && widowHit) continue;
    const hit = findAny(tokens, list);
    if (hit) {
      // "मां बनने वाली" is about becoming a mother, not about one's mother
      const nxt = tokens[hit.i + hit.len] || '';
      if (code === 'mother' && /^(बनने|banne|ban|बन)/.test(nxt)) continue;
      p.subject = code; p.gender = SUBJECT_GENDER[code]; break;
    }
  }

  // situations
  if (findAny(tokens, PREGNANT)) { p.pregnant = true; p.gender = 'female'; }
  if (findAny(tokens, CHILD_3)) p.childOrder = 3;
  else if (findAny(tokens, CHILD_2)) p.childOrder = 2;
  else if (findAny(tokens, CHILD_1) && (p.pregnant || findAny(tokens, N(['child', 'baby', 'bachcha', 'बच्चा', 'मां', 'maa', 'mother'])))) p.childOrder = 1;

  // gender from self-description and Hindi verb endings
  if (!p.gender) {
    const s = pad(tokens);
    const fem = /\S+(ती|ti) (हूं|hoon|hun|hu)(?= )|(वाली|wali) (हूं|hoon|hun|hu)|(की|ki) (हूं|hoon|hun|hu)(?= )|(रही|rahi) (हूं|hoon|hun|hu)/.test(s);
    const mal = /\S+(ता|ta) (हूं|hoon|hun|hu)(?= )|(वाला|wala) (हूं|hoon|hun|hu)|(का|ka) (हूं|hoon|hun|hu)(?= )|(रहा|raha) (हूं|hoon|hun|hu)/.test(s);
    if (findAny(tokens, FEMALE, true) || (fem && !mal)) p.gender = 'female';
    else if (findAny(tokens, MALE, true) || (mal && !fem)) p.gender = 'male';
  }

  // occupation
  for (const [code, list] of OCCUPATIONS) {
    const hit = findAny(tokens, list);
    if (hit) {
      if (code === 'unemployed' || !negated(tokens, hit)) { p.occupation = code; break; }
    }
  }

  // ration card, EPF, income tax
  const r = findAny(tokens, RATION);
  if (r) p.hasRationCard = !negated(tokens, r);
  const e = findAny(tokens, EPF, true);
  if (e) p.epf = !negated(tokens, e);
  const tx = findAny(tokens, TAX, true);
  if (tx) {
    p.taxPayer = !negated(tokens, tx);
    // stop "income tax" from being read as income
    for (let k = tx.i; k < tx.i + tx.len; k++) tokens[k] = '_';
  }

  // numbers: land, age, income
  tokens.forEach((t, i) => {
    if (!/^\d+(\.\d+)?$/.test(t)) return;
    const v = parseFloat(t);
    const next = tokens[i + 1];
    const unit = LAND_UNITS[next];
    if (unit !== undefined) {
      p.hasLand = true;
      if (unit === 'bigha') { p.landBigha = v; } else p.landAcres = Math.round(v * unit * 100) / 100;
      used.add(i); return;
    }
    if (p.age === undefined && Number.isInteger(v) && v > 0 && v <= 120) {
      const prev = tokens[i - 1];
      const ageUnit = AGE_UNITS.has(next) && !DURATION_AFTER.has(tokens[i + 2]) && !DURATION_BEFORE.has(prev) && !MONEY_WORDS.has(tokens[i + 2]);
      const ageWord = AGE_BEFORE.has(prev) && !MONEY_WORDS.has(next) && !MULT[next] && !YEAR_WORDS.has(next) && !MONTH_WORDS.has(next);
      const kaHoon = KA_KI.has(next) && HOON.has(tokens[i + 2]);
      if (ageUnit || ageWord || kaHoon) { p.age = v; used.add(i); return; }
    }
  });

  const zero = findAny(tokens, ZERO_INCOME);
  if (zero) p.incomeMonthly = 0;
  else {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (used.has(i) || !/^\d+(\.\d+)?$/.test(t)) continue;
      const v = parseFloat(t);
      const win = tokens.slice(Math.max(0, i - 4), i + 5);
      const money = win.some((w) => MONEY_WORDS.has(w));
      if (!money && v < 500) continue;
      if (!money && !win.some((w) => MONTH_WORDS.has(w) || YEAR_WORDS.has(w))) continue;
      const monthly = win.some((w) => MONTH_WORDS.has(w));
      const yearly = !monthly && win.some((w) => YEAR_WORDS.has(w));
      const perMonth = monthly ? v : yearly ? v / 12 : v >= 100000 ? v / 12 : v;
      p.incomeMonthly = Math.round(perMonth);
      used.add(i);
      break;
    }
  }

  // land without a number
  if (p.hasLand === undefined) {
    if (findAny(tokens, LAND_NO)) p.hasLand = false;
    else {
      const l = findAny(tokens, LAND_YES);
      if (l) p.hasLand = !negated(tokens, l);
    }
  }

  // places
  const places = findPlaces(tokens);
  if (places.length) {
    const city = places.find((m) => m.city);
    if (city) p.city = city.city;
    const byState = [];
    for (const m of places) {
      const ex = byState.find((x) => x.state === m.state);
      if (ex) ex.role = ex.role || m.role; else byState.push({ ...m });
    }
    if (byState.length === 1) {
      p.state = byState[0].state; p.homeState = byState[0].state;
    } else {
      const home = byState.find((m) => m.role === 'home') || byState[0];
      const cur = byState.find((m) => m !== home && m.role === 'current') || byState.find((m) => m !== home);
      p.homeState = home.state; p.state = cur.state; p.migrant = true;
    }
  }
  if (findAny(tokens, MIGRANT)) p.migrant = true;
  if (p.migrant === undefined && p.state) p.migrant = false;

  return p;
}

/** Parse a reply to a specific follow-up question. */
export function parseAnswer(text, field) {
  const raw = norm(text);
  const tokens = numberise(raw.split(' '), true);
  if (findAny(tokens, SKIP)) return { __skip: true };
  const general = parseUtterance(text, { allowAmbiguous: true });
  const out = { ...general };
  const firstNum = tokens.find((t) => /^\d+(\.\d+)?$/.test(t));
  const isNo = !!findAny(tokens, NO, true);
  const isYes = !isNo && !!findAny(tokens, YES, true);

  if (field === 'age' && out.age === undefined && firstNum) {
    const v = parseFloat(firstNum);
    if (v > 0 && v <= 120) out.age = Math.round(v);
  }
  if (field === 'incomeMonthly' && out.incomeMonthly === undefined) {
    if (firstNum) {
      const v = parseFloat(firstNum);
      const yearly = tokens.some((w) => YEAR_WORDS.has(w)) && !tokens.some((w) => MONTH_WORDS.has(w));
      out.incomeMonthly = Math.round(yearly || v >= 100000 ? v / 12 : v);
    } else if (isNo || findAny(tokens, N(['kuch nahi', 'कुछ नहीं', 'nothing', 'zero']))) out.incomeMonthly = 0;
  }
  if (field === 'childOrder' && out.childOrder === undefined) {
    if (findAny(tokens, N(['first', 'pehla', 'pahla', 'pehli', 'pahli', 'पहला', 'पहली']))) out.childOrder = 1;
    else if (findAny(tokens, N(['second', 'dusra', 'doosra', 'dusri', 'doosri', 'दूसरा', 'दूसरी']))) out.childOrder = 2;
    else if (findAny(tokens, N(['third', 'teesra', 'teesri', 'तीसरा', 'तीसरी', 'more']))) out.childOrder = 3;
    else if (firstNum) out.childOrder = Math.min(3, Math.max(1, parseInt(firstNum, 10)));
    else if (isYes) out.childOrder = 1;
    else if (isNo) out.childOrder = 2;
  }
  if (field === 'hasLand' && out.hasLand === undefined) {
    if (isYes) out.hasLand = true;
    else if (isNo) out.hasLand = false;
  }
  return out;
}

export function isEndCall(text) {
  const tokens = norm(text).split(' ');
  return !!findAny(tokens, END_CALL, true) && tokens.length <= 5;
}

export function countDetails(delta) {
  return Object.keys(delta).filter((k) => !k.startsWith('__') && k !== 'migrant' && k !== 'homeState').length;
}

export const STATE_CODES = Object.keys(STATE_ALIASES);

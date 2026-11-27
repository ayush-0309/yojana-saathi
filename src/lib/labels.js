// Display labels for profile values, in Hindi and English.

export const STATES = {
  andhra_pradesh: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  arunachal_pradesh: { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  assam: { en: 'Assam', hi: 'असम' },
  bihar: { en: 'Bihar', hi: 'बिहार' },
  chhattisgarh: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  delhi: { en: 'Delhi', hi: 'दिल्ली' },
  goa: { en: 'Goa', hi: 'गोवा' },
  gujarat: { en: 'Gujarat', hi: 'गुजरात' },
  haryana: { en: 'Haryana', hi: 'हरियाणा' },
  himachal_pradesh: { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  jammu_kashmir: { en: 'Jammu & Kashmir', hi: 'जम्मू-कश्मीर' },
  jharkhand: { en: 'Jharkhand', hi: 'झारखंड' },
  karnataka: { en: 'Karnataka', hi: 'कर्नाटक' },
  kerala: { en: 'Kerala', hi: 'केरल' },
  ladakh: { en: 'Ladakh', hi: 'लद्दाख' },
  madhya_pradesh: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  maharashtra: { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  manipur: { en: 'Manipur', hi: 'मणिपुर' },
  meghalaya: { en: 'Meghalaya', hi: 'मेघालय' },
  mizoram: { en: 'Mizoram', hi: 'मिज़ोरम' },
  nagaland: { en: 'Nagaland', hi: 'नागालैंड' },
  odisha: { en: 'Odisha', hi: 'ओडिशा' },
  punjab: { en: 'Punjab', hi: 'पंजाब' },
  rajasthan: { en: 'Rajasthan', hi: 'राजस्थान' },
  sikkim: { en: 'Sikkim', hi: 'सिक्किम' },
  tamil_nadu: { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  telangana: { en: 'Telangana', hi: 'तेलंगाना' },
  tripura: { en: 'Tripura', hi: 'त्रिपुरा' },
  uttar_pradesh: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  uttarakhand: { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  west_bengal: { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  chandigarh: { en: 'Chandigarh', hi: 'चंडीगढ़' },
  puducherry: { en: 'Puducherry', hi: 'पुडुचेरी' },
};

export const OCCUPATIONS = {
  farmer: { en: 'Farmer', hi: 'किसान' },
  construction_worker: { en: 'Construction worker', hi: 'निर्माण मज़दूर' },
  labourer: { en: 'Daily-wage worker', hi: 'दिहाड़ी मज़दूर' },
  agri_labourer: { en: 'Farm labourer', hi: 'खेत मज़दूर' },
  domestic_worker: { en: 'Domestic worker', hi: 'घरेलू कामगार' },
  street_vendor: { en: 'Street vendor', hi: 'रेहड़ी-पटरी वाले' },
  driver: { en: 'Driver', hi: 'ड्राइवर' },
  artisan: { en: 'Skilled worker (tailor, carpenter…)', hi: 'कारीगर (दर्जी, बढ़ई…)' },
  homemaker: { en: 'Homemaker', hi: 'गृहिणी' },
  salaried: { en: 'Regular salaried job', hi: 'नियमित नौकरी' },
  student: { en: 'Student', hi: 'छात्र' },
  unemployed: { en: 'No work right now', hi: 'अभी कोई काम नहीं' },
};

export const SUBJECTS = {
  self: { en: 'Myself', hi: 'मैं ख़ुद', poss: { en: 'your', hi: 'आपकी' }, who: { en: 'you', hi: 'आप' } },
  mother: { en: 'My mother', hi: 'मेरी माँ', rel: { en: 'mother', hi: 'आपकी माँ' } },
  father: { en: 'My father', hi: 'मेरे पिता', rel: { en: 'father', hi: 'आपके पिता' } },
  wife: { en: 'My wife', hi: 'मेरी पत्नी', rel: { en: 'wife', hi: 'आपकी पत्नी' } },
  husband: { en: 'My husband', hi: 'मेरे पति', rel: { en: 'husband', hi: 'आपके पति' } },
  grandmother: { en: 'My grandmother', hi: 'मेरी दादी / नानी', rel: { en: 'grandmother', hi: 'आपकी दादी / नानी' } },
  grandfather: { en: 'My grandfather', hi: 'मेरे दादा / नाना', rel: { en: 'grandfather', hi: 'आपके दादा / नाना' } },
};

export const GENDERS = { female: { en: 'Woman', hi: 'महिला' }, male: { en: 'Man', hi: 'पुरुष' } };

export const CHILD_ORDER = {
  1: { en: 'First child', hi: 'पहला बच्चा' },
  2: { en: 'Second child', hi: 'दूसरा बच्चा' },
  3: { en: 'Third child or more', hi: 'तीसरा या उससे ज़्यादा' },
};

export const INCOME_CHOICES = [
  { value: 0, en: 'No income', hi: 'कोई कमाई नहीं' },
  { value: { min: 1, max: 15000 }, en: 'Up to ₹15,000 a month', hi: 'महीने के ₹15,000 तक' },
  { value: { min: 15001, max: 25000 }, en: '₹15,000 – ₹25,000 a month', hi: 'महीने के ₹15,000 – ₹25,000' },
  { value: { min: 25001, max: 1e9 }, en: 'More than ₹25,000 a month', hi: 'महीने के ₹25,000 से ज़्यादा' },
];

export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export function incomeText(v, lang) {
  if (v === undefined || v === null) return '';
  if (v === 0) return lang === 'hi' ? 'कोई कमाई नहीं' : 'no income';
  if (typeof v === 'object') {
    const c = INCOME_CHOICES.find((x) => typeof x.value === 'object' && x.value.min === v.min && x.value.max === v.max);
    if (c) return c[lang];
    return lang === 'hi' ? `महीने के ${inr(v.min)}–${inr(v.max)}` : `${inr(v.min)}–${inr(v.max)} a month`;
  }
  return lang === 'hi' ? `महीने के ${inr(v)}` : `${inr(v)} a month`;
}

export function landText(p, lang) {
  if (p.hasLand === false) return lang === 'hi' ? 'ज़मीन नहीं' : 'No land';
  if (p.landAcres) return lang === 'hi' ? `${p.landAcres} एकड़ ज़मीन` : `${p.landAcres} acre${p.landAcres === 1 ? '' : 's'} of land`;
  if (p.landBigha) return lang === 'hi' ? `${p.landBigha} बीघा ज़मीन` : `${p.landBigha} bigha of land`;
  if (p.hasLand) return lang === 'hi' ? 'ज़मीन है' : 'Has land';
  return '';
}

const ageNum = (age) => (typeof age === 'object' && age ? (age.max >= 110 ? `${age.min}+` : `${age.min}–${age.max}`) : age);
export function ageText(age, lang) {
  return lang === 'hi' ? `${ageNum(age)} साल` : `${ageNum(age)} years`;
}

export function stateText(p, lang) {
  if (!p.state) return '';
  const st = STATES[p.state]?.[lang] || p.state;
  const city = p.city && p.city[lang];
  return city ? `${city}, ${st}` : st;
}

/** Fill {age} {income} {occupation} {childOrder} placeholders from the profile. */
export function fill(tpl, p, lang) {
  const out = tpl
    .replace('{age}', p.age === undefined ? '?' : ageNum(p.age))
    .replace('{income}', incomeText(p.incomeMonthly, lang))
    .replace('{occupation}', (OCCUPATIONS[p.occupation]?.[lang] || '').toLowerCase())
    .replace('{childOrder}', CHILD_ORDER[p.childOrder]?.[lang] || '');
  return out.charAt(0).toUpperCase() + out.slice(1);
}

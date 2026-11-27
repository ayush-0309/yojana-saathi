// Eligibility engine. Pure functions over the seed data — no scheme, rule or
// amount exists outside src/data/schemes.json.
import seed from '../data/schemes.json';

export const SCHEMES = seed.schemes;
export const MAX_FOLLOW_UPS = 3;

export const UNORGANISED = new Set([
  'construction_worker', 'labourer', 'agri_labourer', 'domestic_worker',
  'street_vendor', 'driver', 'artisan',
]);

// What people ask about → which schemes to bring up even if a detail is unknown.
export const TOPIC_SCHEMES = {
  insurance: ['pmsby', 'pmjjby', 'vay-vandana', 'pmfby'],
  health: ['vay-vandana'],
  pension: ['haryana-oasa', 'pm-sym'],
  loan: ['kcc'],
  ration: ['onorc'],
  savings: ['ssy', 'pm-sym'],
  girl: ['ssy', 'pmmvy'],
  baby: ['pmmvy', 'ssy'],
  farming: ['pm-kisan', 'pmfby', 'kcc'],
  worker: ['e-shram', 'pm-sym', 'pmsby'],
  elder: ['vay-vandana', 'haryana-oasa'],
};

// Which missing detail to offer to ask about first.
const ASK_PRIORITY = ['childOrder', 'age', 'incomeMonthly', 'hasLand'];

export function getValue(profile, field) {
  if (field === 'unorganised') {
    if (!profile.occupation) return undefined;
    return UNORGANISED.has(profile.occupation);
  }
  if (field === 'maternity') {
    if (profile.pregnant || profile.recentBirth) return true;
    return undefined;
  }
  // Someone who is pregnant is of working age, even if the exact age is unknown.
  if (field === 'age' && (profile.age === undefined || profile.age === null) && profile.pregnant && !profile.subject) return { min: 15, max: 55 };
  return profile[field];
}

const isRange = (v) => v && typeof v === 'object' && 'min' in v && 'max' in v;

function cmp(v, op, value) {
  if (isRange(v)) {
    const lo = v.min, hi = v.max;
    switch (op) {
      case 'gte': return lo >= value ? true : hi < value ? false : null;
      case 'lte': return hi <= value ? true : lo > value ? false : null;
      case 'between': {
        const [a, b] = value;
        if (lo >= a && hi <= b) return true;
        if (hi < a || lo > b) return false;
        return null;
      }
      default: return null;
    }
  }
  switch (op) {
    case 'eq': return v === value;
    case 'neq': return v !== value;
    case 'gte': return v >= value;
    case 'lte': return v <= value;
    case 'between': return v >= value[0] && v <= value[1];
    case 'in': return value.includes(v);
    default: return null;
  }
}

/** true | false | null (unknown) | 'skip' (condition does not apply) */
export function evalCond(cond, profile) {
  if (cond.onlyIf) {
    const gate = evalCond(cond.onlyIf, profile);
    if (gate !== true) return 'skip';
  }
  const v = getValue(profile, cond.field);
  if (v === undefined || v === null) return null;
  return cmp(v, cond.op, cond.value);
}

export function resolveBenefit(scheme, profile) {
  const b = scheme.benefit;
  const variant = (b.variants || []).find((x) => evalCond(x.if, profile) === true);
  return variant ? { ...b, ...variant, variants: undefined } : b;
}

export function topicSchemeIds(topics = []) {
  return new Set(topics.flatMap((tp) => TOPIC_SCHEMES[tp] || []));
}

/**
 * status: eligible | check | no | hidden
 * topical: the person asked about this kind of scheme, so an unknown
 * "who is it for" detail becomes a check instead of hiding the scheme.
 */
export function evaluateScheme(scheme, profile, topical = false) {
  const skipped = profile.skipped || [];
  const why = [];
  const checks = [];
  const failed = [];
  const askFields = [];
  const base = { scheme, topical, benefit: resolveBenefit(scheme, profile) };

  for (const c of scheme.relevance) {
    const r = evalCond(c, profile);
    if (r === false) return { ...base, status: 'hidden', why, checks, failed, askFields };
    if (r === true) why.push({ cond: c, assumed: false });
    else if (topical) checks.push(c);
    else return { ...base, status: 'hidden', why, checks, failed, askFields };
  }
  for (const c of scheme.rules) {
    const r = evalCond(c, profile);
    if (r === 'skip') continue;
    if (r === true) why.push({ cond: c, assumed: false });
    else if (r === false) failed.push(c);
    else if (c.assumeIfUnknown) why.push({ cond: c, assumed: true });
    else {
      checks.push(c);
      if (c.ask && !skipped.includes(c.field)) askFields.push(c.field);
    }
  }
  let status = 'eligible';
  if (failed.length) status = 'no';
  else if (checks.length) status = 'check';
  return { ...base, status, why, checks, failed, askFields };
}

export function evaluateAll(profile, topics = []) {
  const ids = topicSchemeIds(topics);
  return SCHEMES.map((s) => evaluateScheme(s, profile, ids.has(s.id)));
}

/**
 * What to show the person: schemes that fit what they told us, plus schemes
 * they asked about. Everyone-schemes (insurance by age) only show once they
 * clearly fit, so a vague answer does not bury the useful ones.
 */
export function isShown(r) {
  if (r.status !== 'eligible' && r.status !== 'check') return false;
  if (r.topical || r.scheme.relevance.length > 0) return true;
  return r.status === 'eligible';
}

export function selectShown(all) {
  const shown = all.filter(isShown);
  // likely ones before ones to check; within each, asked-about schemes first
  const rank = (r) => (r.status === 'eligible' ? 0 : 2) + (r.topical ? 0 : 1);
  return shown.map((r, i) => ({ r, i })).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i).map((x) => x.r);
}

/** The single most useful missing detail to offer to ask about, or null. */
export function suggestField(all, profile, asked = 0) {
  if (asked >= MAX_FOLLOW_UPS) return null;
  const counts = {};
  for (const r of all) {
    if (r.status !== 'check') continue;
    // only details that would change something we show, or bring in an everyone-scheme
    if (!isShown(r) && r.scheme.relevance.length > 0) continue;
    for (const f of r.askFields) counts[f] = (counts[f] || 0) + 1;
  }
  return ASK_PRIORITY.find((f) => counts[f]) || null;
}

/** Kept for compatibility: the next field the old step-by-step flow would ask. */
export function nextQuestionField(profile, askedCount = 0) {
  return suggestField(evaluateAll(profile), profile, askedCount);
}

export function summarize(results) {
  const eligible = results.filter((r) => r.status === 'eligible');
  const check = results.filter((r) => r.status === 'check');
  let cashYearly = 0;
  let oneTime = 0;
  let insurance = 0;
  for (const r of eligible) {
    const b = r.benefit;
    if (b.kind === 'cash_yearly') cashYearly += b.amountYearly;
    if (b.kind === 'cash_monthly') cashYearly += b.amountMonthly * 12;
    if (b.kind === 'cash_once') oneTime += b.amount;
    if (b.kind === 'insurance') insurance += 1;
  }
  return { eligible, check, cashYearly, oneTime, insurance };
}

export function hasAnyDetail(profile) {
  return Object.entries(profile).some(([k, v]) => k !== 'skipped' && k !== 'subject' && v !== undefined && v !== null);
}

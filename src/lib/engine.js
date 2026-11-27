// Eligibility engine. Pure functions over the seed data — no scheme, rule or
// amount exists outside src/data/schemes.json.
import seed from '../data/schemes.json';

export const SCHEMES = seed.schemes;
export const MAX_FOLLOW_UPS = 3;

export const UNORGANISED = new Set([
  'construction_worker', 'labourer', 'agri_labourer', 'domestic_worker',
  'street_vendor', 'driver', 'artisan',
]);

// Which missing detail to ask about first when several would change results.
const ASK_PRIORITY = ['age', 'childOrder', 'incomeMonthly', 'hasLand'];

export function getValue(profile, field) {
  if (field === 'unorganised') {
    if (!profile.occupation) return undefined;
    return UNORGANISED.has(profile.occupation);
  }
  // Someone who is pregnant is of working age, even if the exact age is unknown.
  if (field === 'age' && (profile.age === undefined || profile.age === null) && profile.pregnant) return { min: 15, max: 55 };
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

export function evaluateScheme(scheme, profile) {
  const skipped = profile.skipped || [];
  const why = [];
  const checks = [];
  const failed = [];
  const askFields = [];

  for (const c of scheme.relevance) {
    const r = evalCond(c, profile);
    if (r !== true) return { scheme, status: 'hidden', why, checks, failed, askFields };
    why.push({ cond: c, assumed: false });
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
  return { scheme, status, why, checks, failed, askFields, benefit: resolveBenefit(scheme, profile) };
}

export function evaluateAll(profile) {
  return SCHEMES.map((s) => evaluateScheme(s, profile));
}

/** The single most useful missing detail, or null. */
export function nextQuestionField(profile, askedCount = 0) {
  if (askedCount >= MAX_FOLLOW_UPS) return null;
  const counts = {};
  for (const r of evaluateAll(profile)) {
    if (r.status !== 'check') continue;
    for (const f of r.askFields) counts[f] = (counts[f] || 0) + 1;
  }
  return ASK_PRIORITY.find((f) => counts[f]) || null;
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

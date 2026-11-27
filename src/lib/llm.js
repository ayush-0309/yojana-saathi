// Optional LLM extraction. Only used when VITE_LLM_EXTRACT_URL points at a proxy
// you control (never put an API key in browser code). The proxy receives
// { transcript } and must return a profile JSON; anything outside the allowed
// keys and value types is dropped. Replies are still phrased from seed data only.
import { STATE_CODES } from './parser.js';
import { OCCUPATIONS, SUBJECTS } from './labels.js';

const URL_ = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_LLM_EXTRACT_URL : undefined;

const SCHEMA = {
  subject: (v) => v in SUBJECTS,
  state: (v) => STATE_CODES.includes(v),
  homeState: (v) => STATE_CODES.includes(v),
  occupation: (v) => v in OCCUPATIONS,
  age: (v) => Number.isInteger(v) && v > 0 && v <= 120,
  gender: (v) => v === 'female' || v === 'male',
  hasLand: (v) => typeof v === 'boolean',
  landAcres: (v) => typeof v === 'number' && v >= 0,
  incomeMonthly: (v) => typeof v === 'number' && v >= 0,
  pregnant: (v) => typeof v === 'boolean',
  childOrder: (v) => [1, 2, 3].includes(v),
  widow: (v) => typeof v === 'boolean',
  migrant: (v) => typeof v === 'boolean',
  hasRationCard: (v) => typeof v === 'boolean',
  taxPayer: (v) => typeof v === 'boolean',
  epf: (v) => typeof v === 'boolean',
};

export async function extractWithLLM(transcript) {
  if (!URL_) return null;
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, schema: Object.keys(SCHEMA) }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const out = {};
  for (const [k, ok] of Object.entries(SCHEMA)) if (data && data[k] !== undefined && ok(data[k])) out[k] = data[k];
  return Object.keys(out).length ? out : null;
}

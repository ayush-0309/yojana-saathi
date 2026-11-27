// Conversation shared by the chat screen and call mode.
// Answer first: every message gets schemes or an answer straight away.
// Missing details are offered as one optional question, never required.
import { parseUtterance, parseAnswer, countDetails, detectTopics } from './parser.js';
import { evaluateAll, selectShown, suggestField, summarize, hasAnyDetail } from './engine.js';
import { notUnderstood, conversationalReply, softAsk } from './i18n.js';
import { extractWithLLM } from './llm.js';
import { answerQuestion, capabilityText } from './qa.js';

export const initialConv = () => ({ profile: {}, topics: [], asked: 0, suggest: null, phase: 'idle' });

export function mergeProfile(base, delta) {
  const out = { ...base };
  for (const [k, v] of Object.entries(delta)) {
    if (k.startsWith('__') || v === undefined) continue;
    if (k === 'migrant') out.migrant = !!(base.migrant || v);
    else out[k] = v;
  }
  if (delta.state && !delta.homeState) out.homeState = delta.state;
  if (out.state && out.homeState && out.state !== out.homeState) out.migrant = true;
  return out;
}

const IGNORE = new Set(['migrant', 'homeState', 'city', 'skipped', 'gender']);
/** Does the new message describe a different person or situation? */
function conflicts(base, delta) {
  if (delta.subject !== undefined && delta.subject !== base.subject) return true;
  return Object.entries(delta).some(([k, v]) => !k.startsWith('__') && !IGNORE.has(k) && base[k] !== undefined && JSON.stringify(base[k]) !== JSON.stringify(v));
}

/** Results for this profile + topics, with an optional follow-up offer. */
export function respond(profile, topics, asked, lang, { noSuggest = false } = {}) {
  const all = evaluateAll(profile, topics);
  const shown = selectShown(all);
  const sum = summarize(shown);
  const suggest = noSuggest ? null : suggestField(all, profile, asked);
  const reply = conversationalReply(sum, profile, lang);
  const ask = suggest ? softAsk(suggest, profile, lang) : '';
  return {
    conv: { profile, topics, asked: asked + (suggest ? 1 : 0), suggest, phase: 'results' },
    message: {
      role: 'bot',
      text: reply.text,
      speech: ask ? `${reply.speech} ${ask}` : reply.speech,
      understood: profile,
      topics,
      cards: shown.length > 0,
      suggest,
      suggestText: ask,
    },
    summary: sum,
  };
}

/** Apply a tapped answer to the offered follow-up. */
export function answerDirect(conv, field, value, lang) {
  const profile = value === '__skip'
    ? { ...conv.profile, skipped: [...(conv.profile.skipped || []), field] }
    : mergeProfile(conv.profile, { [field]: value });
  return respond(profile, conv.topics, conv.asked, lang);
}

/** Start from a tapped "who is this for" tile. */
export function startWith(delta, lang, topics = []) {
  return respond(mergeProfile({}, delta), topics, 0, lang);
}

/** Handle one thing the person said or typed. opts.fresh: start a new conversation. */
export async function handleUtterance(conv, text, lang, opts = {}) {
  let delta = parseUtterance(text);
  const topics = detectTopics(text);

  // A reply to the optional question we offered ("45", "pehla bachcha", "pata nahi")
  if (conv.suggest && !opts.fresh) {
    const a = parseAnswer(text, conv.suggest);
    if (a.__skip) return answerDirect(conv, conv.suggest, '__skip', lang);
    if (a[conv.suggest] !== undefined && countDetails(delta) <= 1) {
      return respond(mergeProfile(conv.profile, a), conv.topics, conv.asked, lang);
    }
  }

  // A direct question about one scheme or about the helper
  const q = opts.fresh ? null : answerQuestion(text, lang);
  if (q && (q.scheme ? countDetails(delta) < 2 : countDetails(delta) === 0 && !topics.length)) {
    return { conv, message: { role: 'bot', text: q.text, speech: q.speech, scheme: q.scheme, browse: q.browse } };
  }

  if (countDetails(delta) === 0 && !topics.length) {
    const llm = await extractWithLLM(text).catch(() => null);
    if (llm) delta = llm;
  }
  if (countDetails(delta) === 0 && !topics.length) {
    if (hasAnyDetail(conv.profile) && conv.phase === 'results') {
      // keep the conversation going instead of starting over
      const s = notUnderstood(lang);
      return { conv, message: { role: 'bot', text: s, speech: s, browse: true } };
    }
    const s = `${notUnderstood(lang)} ${capabilityText(lang)}`;
    return { conv: initialConv(), message: { role: 'bot', text: s, speech: notUnderstood(lang), browse: true } };
  }

  const fresh = opts.fresh || conv.phase === 'idle' || conflicts(conv.profile, delta);
  const profile = mergeProfile(fresh ? {} : conv.profile, delta);
  const allTopics = fresh ? topics : [...new Set([...(conv.topics || []), ...topics])];
  return respond(profile, allTopics, fresh ? 0 : conv.asked, lang);
}

/** Re-run results after the person edits a chip. */
export function recompute(profile, lang, topics = []) {
  return respond(profile, topics, 99, lang, { noSuggest: true });
}

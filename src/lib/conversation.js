// Conversation state machine shared by the chat screen and call mode.
import { parseUtterance, parseAnswer, countDetails } from './parser.js';
import { evaluateAll, nextQuestionField, summarize, hasAnyDetail } from './engine.js';
import { questionText, sorryAnswer, notUnderstood, resultsReply } from './i18n.js';
import { extractWithLLM } from './llm.js';
import { answerQuestion, capabilityText } from './qa.js';

export const initialConv = () => ({ profile: {}, asked: 0, awaiting: null, phase: 'idle', retries: 0 });

export function mergeProfile(base, delta) {
  const out = { ...base };
  for (const [k, v] of Object.entries(delta)) {
    if (k.startsWith('__') || v === undefined) continue;
    if (k === 'migrant') out.migrant = !!(base.migrant || v);
    else out[k] = v;
  }
  // a new single state without a "from" state means they are not away from home
  if (delta.state && !delta.homeState) out.homeState = delta.state;
  if (out.state && out.homeState && out.state !== out.homeState) out.migrant = true;
  return out;
}

function finish(profile, asked, lang) {
  const sum = summarize(evaluateAll(profile));
  const reply = resultsReply(sum, profile, lang);
  return {
    conv: { profile, asked, awaiting: null, phase: 'results', retries: 0 },
    message: { role: 'bot', text: reply.text, speech: reply.speech, understood: profile, results: true },
    summary: sum,
  };
}

export function askOrFinish(profile, asked, lang) {
  const q = nextQuestionField(profile, asked);
  if (!q) return finish(profile, asked, lang);
  const text = questionText(q, profile, lang);
  return {
    conv: { profile, asked: asked + 1, awaiting: q, phase: 'asking', retries: 0 },
    message: { role: 'bot', text, speech: text, understood: profile, ask: q },
  };
}

/** Apply a direct answer (tapped chip / stepper) to the current follow-up. */
export function answerDirect(conv, field, value, lang) {
  let profile;
  if (value === '__skip') profile = { ...conv.profile, skipped: [...(conv.profile.skipped || []), field] };
  else profile = mergeProfile(conv.profile, { [field]: value });
  return askOrFinish(profile, conv.asked, lang);
}

/**
 * Handle one thing the person said.
 * opts.fresh: start a new profile (tapped example chip).
 */
export async function handleUtterance(conv, text, lang, opts = {}) {
  if (conv.awaiting && !opts.fresh) {
    const field = conv.awaiting;
    const delta = parseAnswer(text, field);
    if (delta.__skip) return answerDirect(conv, field, '__skip', lang);
    if (delta[field] === undefined) {
      // a whole new description instead of an answer → start over with it
      if (countDetails(delta) >= 2) return handleUtterance(initialConv(), text, lang);
      if (conv.retries >= 1) return answerDirect(conv, field, '__skip', lang);
      const s = sorryAnswer(field, conv.profile, lang);
      return {
        conv: { ...conv, retries: conv.retries + 1 },
        message: { role: 'bot', text: s, speech: s, ask: field, understood: conv.profile },
      };
    }
    return askOrFinish(mergeProfile(conv.profile, delta), conv.asked, lang);
  }

  let delta = parseUtterance(text);
  // A direct question about a scheme (or about the helper) gets a direct answer.
  const q = opts.fresh ? null : answerQuestion(text, lang);
  if (q && (q.scheme ? countDetails(delta) < 2 : countDetails(delta) === 0)) {
    return { conv, message: { role: 'bot', text: q.text, speech: q.speech, scheme: q.scheme, browse: q.browse } };
  }
  if (countDetails(delta) === 0) {
    const llm = await extractWithLLM(text).catch(() => null);
    if (llm) delta = llm;
  }
  const startFresh = opts.fresh || conv.phase === 'idle' || (conv.phase === 'results' && countDetails(delta) >= 2);
  const base = startFresh ? {} : conv.profile;
  const asked = startFresh ? 0 : conv.asked;
  if (countDetails(delta) === 0 && !hasAnyDetail(base)) {
    const s = `${notUnderstood(lang)} ${capabilityText(lang)}`;
    return { conv: { ...initialConv() }, message: { role: 'bot', text: s, speech: notUnderstood(lang), browse: true } };
  }
  return askOrFinish(mergeProfile(base, delta), asked, lang);
}

/** Start from a tapped "who is this for" tile. */
export function startWith(delta, lang) {
  return askOrFinish(mergeProfile({}, delta), 0, lang);
}

/** Re-run results after the person edits a chip. */
export function recompute(profile, lang) {
  return finish(profile, 99, lang);
}

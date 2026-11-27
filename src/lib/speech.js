// Web Speech API wrappers: listening (SpeechRecognition) and speaking (speechSynthesis).
import { useEffect, useState } from 'react';

const W = typeof window !== 'undefined' ? window : {};
const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
export const canListen = !!SR;
export const canSpeak = !!W.speechSynthesis;
const BCP = { hi: 'hi-IN', en: 'en-IN' };

/** Listen for one utterance. Returns a stop() that ends listening (final text is still delivered). */
export function listenOnce({ lang, onInterim, onEnd, onError }) {
  if (!SR) { onError?.('unsupported'); onEnd?.(''); return { stop() {}, abort() {} }; }
  const rec = new SR();
  rec.lang = BCP[lang] || 'hi-IN';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = '';
  let latest = '';
  let ended = false;
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + ' ';
      else interim += r[0].transcript;
    }
    latest = (finalText + interim).trim();
    onInterim?.(latest);
  };
  rec.onerror = (e) => onError?.(e.error);
  rec.onend = () => { if (ended) return; ended = true; onEnd?.((finalText.trim() || latest).trim()); };
  try { rec.start(); } catch { onError?.('start-failed'); ended = true; onEnd?.(''); }
  return { stop: () => { try { rec.stop(); } catch { /* already stopped */ } }, abort: () => { ended = true; try { rec.abort(); } catch { /* noop */ } } };
}

// ---------- speaking ----------
let voices = [];
function loadVoices() { voices = canSpeak ? W.speechSynthesis.getVoices() : []; }
if (canSpeak) { loadVoices(); W.speechSynthesis.addEventListener?.('voiceschanged', loadVoices); }

function pickVoice(lang) {
  const want = BCP[lang];
  const norm = (v) => v.lang.replace('_', '-').toLowerCase();
  return voices.find((v) => norm(v) === want.toLowerCase())
    || voices.find((v) => norm(v).startsWith(lang))
    || null;
}

const listeners = new Set();
let speakingNow = false;
function setSpeaking(v) { speakingNow = v; listeners.forEach((fn) => fn(v)); }
export function useSpeaking() {
  const [v, setV] = useState(speakingNow);
  useEffect(() => { listeners.add(setV); return () => listeners.delete(setV); }, []);
  return v;
}

/** Make text easier to speak: rupee amounts, dashes, symbols. */
export function speakable(text, lang) {
  const rupees = lang === 'hi' ? 'रुपये' : 'rupees';
  return String(text)
    .replace(/₹\s?(\d+(?:,\d+)*(?:\.\d+)?)(\s?(?:lakh|लाख))?/g, (_, n, l) => `${n}${l || ''} ${rupees}`)
    .replace(/[—–]/g, ', ')
    .replace(/[•✓]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let current = null; // { resolve }
export function stopSpeaking() {
  if (!canSpeak) return;
  W.speechSynthesis.cancel();
  if (current) { current.resolve(); current = null; }
  setSpeaking(false);
}

/** Speak text in hi/en. Resolves when finished or stopped. */
export function speak(text, lang) {
  if (!canSpeak || !text) return Promise.resolve();
  stopSpeaking();
  const clean = speakable(text, lang);
  const chunks = clean.split(/(?<=\D[.!?।])\s+/).flatMap((s) => (s.length > 220 ? s.split(/(?<=,)\s+/) : [s])).filter(Boolean);
  const voice = pickVoice(lang);
  return new Promise((resolve) => {
    const me = { resolve };
    current = me;
    let i = 0;
    let timer;
    const done = () => { clearTimeout(timer); if (current === me) { current = null; setSpeaking(false); resolve(); } };
    const next = () => {
      if (current !== me) return;
      if (i >= chunks.length) return done();
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      u.lang = BCP[lang];
      if (voice) u.voice = voice;
      u.rate = 0.95;
      clearTimeout(timer);
      // safety net: some browsers never fire onend
      timer = setTimeout(next, 4000 + u.text.length * 110);
      u.onend = () => { clearTimeout(timer); next(); };
      u.onerror = () => { clearTimeout(timer); next(); };
      W.speechSynthesis.speak(u);
    };
    setSpeaking(true);
    next();
  });
}

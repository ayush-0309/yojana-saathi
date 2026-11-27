import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { t, EXAMPLES } from '../lib/i18n.js';
import { handleUtterance, initialConv } from '../lib/conversation.js';
import { isEndCall } from '../lib/parser.js';
import { canListen, listenOnce, speak, stopSpeaking } from '../lib/speech.js';

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function Call({ lang, onResults }) {
  const [status, setStatus] = useState('idle'); // idle | speaking | listening | thinking | ended
  const [log, setLog] = useState([]);
  const [heard, setHeard] = useState('');
  const [muted, setMuted] = useState(false);
  const [secs, setSecs] = useState(0);
  const active = useRef(false);
  const conv = useRef(initialConv());
  const rec = useRef(null);
  const turn = useRef(0);
  const misses = useRef(0);
  const mutedRef = useRef(false);
  const blocked = useRef(!canListen);
  const [micBlocked, setMicBlocked] = useState(!canListen);
  const logEnd = useRef(null);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { logEnd.current?.scrollIntoView({ block: 'end' }); }, [log.length]);
  useEffect(() => {
    if (status === 'idle' || status === 'ended') return undefined;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status === 'idle' || status === 'ended']);
  useEffect(() => () => { active.current = false; rec.current?.abort(); stopSpeaking(); }, []);

  const add = (who, text) => setLog((l) => [...l, { who, text, id: Date.now() + Math.random() }]);

  async function say(text) {
    if (!active.current) return;
    setStatus('speaking');
    add('bot', text);
    await speak(text, lang);
  }

  function listen() {
    if (!active.current) return;
    setHeard('');
    if (mutedRef.current || blocked.current) { setStatus('listening'); return; }
    setStatus('listening');
    const my = ++turn.current;
    rec.current = listenOnce({
      lang,
      onInterim: (txt) => my === turn.current && setHeard(txt),
      onError: (err) => {
        if (['not-allowed', 'service-not-allowed', 'audio-capture', 'unsupported', 'start-failed'].includes(err)) { blocked.current = true; setMicBlocked(true); }
      },
      onEnd: (txt) => {
        if (my !== turn.current || !active.current) return;
        if (!txt && blocked.current) return; // no microphone: wait for a tapped caller line
        if (txt) { misses.current = 0; handle(txt); return; }
        misses.current += 1;
        if (misses.current >= 3) { end(true); return; }
        say(t('call.notHeard', lang)).then(listen);
      },
    });
  }

  async function handle(text) {
    turn.current += 1; // ignore any late recogniser callbacks
    rec.current?.abort();
    add('user', text);
    setHeard('');
    if (isEndCall(text)) { await say(t('call.bye', lang)); end(); return; }
    setStatus('thinking');
    const r = await handleUtterance(conv.current, text, lang);
    conv.current = r.conv;
    if (r.summary) onResults?.(r);
    await say(r.summary && !r.conv.suggest ? `${r.message.speech} ${t('call.again', lang)}` : r.message.speech);
    listen();
  }

  async function start() {
    active.current = true;
    conv.current = initialConv();
    misses.current = 0;
    setLog([]);
    setSecs(0);
    await say(t('call.greet', lang));
    listen();
  }

  function end(sayBye) {
    const finish = () => { active.current = false; turn.current += 1; rec.current?.abort(); stopSpeaking(); setStatus('ended'); };
    if (sayBye) say(t('call.bye', lang)).then(finish); else finish();
  }

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    mutedRef.current = m;
    if (m) { turn.current += 1; rec.current?.abort(); } else if (status === 'listening') listen();
  };

  const live = status !== 'idle' && status !== 'ended';
  const sugg = conv.current.suggest;
  const simLines = [
    ...(sugg === 'age' ? [lang === 'hi' ? '45 साल' : '45'] : sugg === 'childOrder' ? [lang === 'hi' ? 'पहला बच्चा' : 'First child'] : []),
    ...EXAMPLES[lang],
    lang === 'hi' ? 'मेरी बेटी हुई है' : 'I just had a daughter',
    'bye',
  ];

  return (
    <main className="mx-auto flex h-[calc(100dvh-73px)] min-h-[560px] max-w-md flex-col bg-brand px-4 pb-6 pt-4 text-white">
      <div className="text-center">
        <div className="relative mx-auto h-24 w-24">
          {status === 'listening' && !muted && <span className="mic-ring absolute inset-0 rounded-full bg-turmeric" aria-hidden="true" />}
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-turmeric text-ink">
            <Phone size={48} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
        <h2 className="mt-4 text-[24px] font-bold">{t('call.title', lang)}</h2>
        <p className="text-small opacity-90">{t('call.demo', lang)}</p>
        <p className="mt-1 font-semibold tabular-nums" aria-live="polite">
          {live ? `${mmss(secs)} · ${status === 'thinking' ? t('thinking', lang) : t(`call.${status}`, lang)}` : status === 'ended' ? t('call.ended', lang) : ''}
        </p>
      </div>

      <section className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-3xl bg-white/10 p-3" aria-label="Call captions" aria-live="polite">
        {log.length === 0 && <p className="opacity-90">{t('call.idle', lang)}</p>}
        {micBlocked && <p className="rounded-2xl bg-white/10 p-3 text-small">{t('call.noVoice', lang)}</p>}
        {log.map((m) => (
          <p key={m.id} className={`rounded-2xl px-3 py-2 ${m.who === 'bot' ? 'bg-white text-ink' : 'ml-8 bg-turmeric text-ink'}`}>{m.text}</p>
        ))}
        {heard && <p className="ml-8 rounded-2xl border-2 border-dashed border-turmeric px-3 py-2">{heard}</p>}
        <div ref={logEnd} />
      </section>

      {live && (
        <section className="mt-3" aria-label={t('call.simulate', lang)}>
          <p className="mb-1 text-small opacity-90">{t('call.simulate', lang)}</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {simLines.map((s) => (
              <button key={s} type="button" disabled={status === 'speaking' || status === 'thinking'} onClick={() => { stopSpeaking(); handle(s); }} className="min-h-tap max-w-[260px] shrink-0 truncate rounded-2xl bg-white/15 px-3 text-small font-semibold disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-4 flex items-center justify-center gap-6">
        {live ? (
          <>
            <button type="button" onClick={toggleMute} aria-pressed={muted} className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white/15" aria-label={muted ? t('call.unmute', lang) : t('call.mute', lang)}>
              {muted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            <button type="button" onClick={() => end(false)} className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand" aria-label={t('call.end', lang)}>
              <PhoneOff size={34} />
            </button>
          </>
        ) : (
          <button type="button" onClick={start} className="flex min-h-[64px] items-center gap-3 rounded-full bg-turmeric px-8 text-[20px] font-bold text-ink">
            <Phone size={26} aria-hidden="true" /> {t('call.start', lang)}
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-[14px] leading-snug opacity-90">{t('footer', lang)}</p>
    </main>
  );
}

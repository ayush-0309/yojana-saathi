import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, ClipboardList, Phone, Send, Keyboard, RotateCcw, ArrowRight } from 'lucide-react';
import { t, EXAMPLES } from '../lib/i18n.js';
import { INCOME_CHOICES, CHILD_ORDER } from '../lib/labels.js';
import { canListen } from '../lib/speech.js';
import { ReadAloudButton } from './ui.jsx';
import { UnderstoodCard, Stepper } from './Understood.jsx';

export function MicButton({ listening, onClick, lang, size = 84 }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {listening && (
          <>
            <span className="mic-ring absolute inset-0 rounded-full bg-turmeric" aria-hidden="true" />
            <span className="mic-ring delay absolute inset-0 rounded-full bg-turmeric" aria-hidden="true" />
          </>
        )}
        <button
          type="button"
          onClick={onClick}
          aria-pressed={listening}
          aria-label={listening ? t('listening', lang) : 'बोलिए (Speak)'}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-turmeric text-ink shadow-[0_6px_18px_rgba(232,163,23,0.45)] ring-4 ring-white"
        >
          {listening ? <Square size={size * 0.34} fill="currentColor" strokeWidth={0} /> : <Mic size={size * 0.44} strokeWidth={2.2} />}
        </button>
      </div>
      <span className="mt-1 text-small font-semibold text-ink" aria-hidden="true">{listening ? t('listening', lang) : 'बोलिए (Speak)'}</span>
    </div>
  );
}

export function BottomBar({ lang, listening, onMic, onApps, onCall, appsCount }) {
  const side = 'flex min-h-tap min-w-[80px] flex-col items-center justify-center rounded-2xl px-2 text-brand';
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white" aria-label="Main">
      <div className="mx-auto flex max-w-md items-end justify-between px-4 pb-2 pt-1">
        <button type="button" className={side} onClick={onApps}>
          <span className="relative">
            <ClipboardList size={26} aria-hidden="true" />
            {appsCount > 0 && <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-[12px] font-bold leading-5 text-white">{appsCount}</span>}
          </span>
          <span className="text-small font-semibold leading-tight">{t('myApps', lang)}</span>
        </button>
        <div className="-mt-8"><MicButton listening={listening} onClick={onMic} lang={lang} /></div>
        <button type="button" className={side} onClick={onCall}>
          <Phone size={26} aria-hidden="true" />
          <span className="text-small font-semibold leading-tight">{t('callMode', lang)}</span>
        </button>
      </div>
    </nav>
  );
}

function AnswerPanel({ field, lang, onAnswer }) {
  const [age, setAge] = useState(40);
  const chip = 'min-h-tap rounded-2xl border-2 border-brand bg-white px-4 py-2 text-left font-semibold text-brand';
  const skip = <button type="button" className="min-h-tap rounded-2xl px-4 font-semibold text-muted underline" onClick={() => onAnswer('__skip', t('dontKnow', lang))}>{t('dontKnow', lang)}</button>;
  if (field === 'age') {
    return (
      <div className="mt-3 rounded-2xl bg-paper p-2">
        <Stepper value={age} onChange={setAge} min={1} max={110} unit={lang === 'hi' ? 'साल' : 'years'} lang={lang} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="min-h-tap flex-1 rounded-2xl bg-brand px-4 font-semibold text-white" onClick={() => onAnswer(age, lang === 'hi' ? `${age} साल` : `${age} years`)}>{t('done', lang)}</button>
          {skip}
        </div>
      </div>
    );
  }
  let options = [];
  if (field === 'incomeMonthly') options = INCOME_CHOICES.map((c) => ({ value: c.value, label: c[lang] }));
  if (field === 'childOrder') options = [1, 2, 3].map((n) => ({ value: n, label: CHILD_ORDER[n][lang] }));
  if (field === 'hasLand') options = [{ value: true, label: lang === 'hi' ? 'हाँ' : 'Yes' }, { value: false, label: lang === 'hi' ? 'नहीं' : 'No' }];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => <button key={o.label} type="button" className={chip} onClick={() => onAnswer(o.value, o.label)}>{o.label}</button>)}
      {skip}
    </div>
  );
}

function BotBubble({ m, lang, latest, onAnswer, onEdit, onSeeResults }) {
  return (
    <li className="flex flex-col items-start gap-2">
      <div className={`${m.ask && latest ? 'w-full' : 'max-w-[92%]'} rounded-3xl rounded-tl-md border border-line bg-white px-4 py-3 text-ink`}>
        <div className="flex items-start gap-1">
          <p className="flex-1 whitespace-pre-line">{m.text}</p>
          <ReadAloudButton text={m.speech || m.text} lang={lang} className="-mr-2 -mt-2" />
        </div>
        {m.ask && latest && <p className="text-small text-muted">{t('whyAsk', lang)}</p>}
        {m.ask && latest && <AnswerPanel field={m.ask} lang={lang} onAnswer={onAnswer} />}
        {m.results && (
          <button type="button" onClick={onSeeResults} className="mt-3 flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 font-semibold text-white">
            {t('seeResults', lang)} <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      {m.understood && latest && <div className="w-full"><UnderstoodCard profile={m.understood} lang={lang} onChange={onEdit} /></div>}
    </li>
  );
}

export function Home({ lang, messages, interim, listening, thinking, micError, onSend, onAnswer, onEdit, onSeeResults, onReset }) {
  const [typing, setTyping] = useState(!canListen);
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, interim, thinking]);
  useEffect(() => { if (micError) setTyping(true); }, [micError]);
  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');
  const showExamples = messages.filter((m) => m.role === 'user').length === 0;

  const submit = (e) => { e.preventDefault(); if (draft.trim()) { onSend(draft.trim()); setDraft(''); } };

  return (
    <main className="mx-auto max-w-md px-4 pb-4 pt-4">
      <ul className="flex flex-col gap-3" aria-live="polite">
        <li className="flex flex-col items-start">
          <div className="max-w-[92%] rounded-3xl rounded-tl-md border border-line bg-white px-4 py-3">
            <div className="flex items-start gap-1">
              <p className="flex-1">{t('welcome', lang)}</p>
              <ReadAloudButton text={t('welcome', lang)} lang={lang} className="-mr-2 -mt-2" />
            </div>
          </div>
        </li>
        {messages.map((m) => m.role === 'user' ? (
          <li key={m.id} className="flex justify-end">
            <p className="max-w-[85%] rounded-3xl rounded-tr-md bg-brand px-4 py-3 text-white">{m.text}</p>
          </li>
        ) : (
          <BotBubble key={m.id} m={m} lang={lang} latest={m === lastBot} onAnswer={onAnswer} onEdit={onEdit} onSeeResults={onSeeResults} />
        ))}
        {listening && (
          <li className="flex justify-end">
            <p className="max-w-[85%] rounded-3xl rounded-tr-md border-2 border-dashed border-brand bg-brand-soft px-4 py-3 text-brand">
              {interim || <span className="typing" aria-label={t('listening', lang)}><span>●</span> <span>●</span> <span>●</span></span>}
            </p>
          </li>
        )}
        {thinking && (
          <li><p className="typing w-fit rounded-3xl border border-line bg-white px-4 py-3 text-muted" aria-label={t('thinking', lang)}><span>●</span> <span>●</span> <span>●</span></p></li>
        )}
      </ul>

      {micError && <p role="status" className="mt-4 rounded-2xl border-l-4 border-check bg-check-bg px-4 py-3 text-check-text">{micError === 'not-allowed' ? t('micDenied', lang) : micError === 'no-speech' ? t('noSpeech', lang) : t('micUnavailable', lang)}</p>}

      <section className="mt-5" aria-label={t('trySaying', lang)}>
        {showExamples && <h2 className="mb-2 text-small font-semibold uppercase tracking-wide text-muted">{t('trySaying', lang)}</h2>}
        {showExamples ? (
          <ul className="flex flex-col gap-2">
            {EXAMPLES[lang].map((ex) => (
              <li key={ex}>
                <button type="button" onClick={() => onSend(ex, { fresh: true })} className="flex min-h-tap w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-2 text-left">
                  <span aria-hidden="true" className="text-turmeric">“</span>
                  <span className="flex-1">{ex}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onReset} className="flex min-h-tap items-center gap-2 rounded-2xl border border-line bg-white px-4 font-semibold text-brand">
              <RotateCcw size={20} aria-hidden="true" /> {t('startAgain', lang)}
            </button>
            {!typing && (
              <button type="button" onClick={() => setTyping(true)} className="flex min-h-tap items-center gap-2 rounded-2xl px-4 font-semibold text-brand">
                <Keyboard size={20} aria-hidden="true" /> {t('typeInstead', lang)}
              </button>
            )}
          </div>
        )}
      </section>

      {showExamples && !typing && (
        <button type="button" onClick={() => setTyping(true)} className="mt-2 flex min-h-tap items-center gap-2 rounded-2xl px-2 font-semibold text-brand">
          <Keyboard size={20} aria-hidden="true" /> {t('typeInstead', lang)}
        </button>
      )}

      {typing && (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="say">{t('typeHere', lang)}</label>
          <input
            id="say"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('typeHere', lang)}
            className="min-h-tap min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 text-body outline-none focus:border-brand"
            autoComplete="off"
          />
          <button type="submit" className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl bg-brand px-4 text-white" aria-label={t('send', lang)}>
            <Send size={22} />
          </button>
        </form>
      )}
      <div ref={endRef} className="h-2" />
    </main>
  );
}

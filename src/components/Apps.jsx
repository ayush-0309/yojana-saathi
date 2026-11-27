import React, { useState } from 'react';
import { Check, Info, Trash2, ChevronRight } from 'lucide-react';
import { t } from '../lib/i18n.js';
import { SCHEMES } from '../lib/engine.js';
import { CategoryIcon } from './ui.jsx';

export const STEPS = ['applied', 'verification', 'approved', 'paid'];

const fmtDate = (ts, lang) => new Date(ts).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });

function Timeline({ status, history, lang, onSet }) {
  const idx = STEPS.indexOf(status);
  return (
    <ol className="mt-3 grid grid-cols-4 gap-1" aria-label={t('status', lang)}>
      {STEPS.map((st, i) => {
        const done = i <= idx;
        return (
          <li key={st}>
            <button type="button" onClick={() => onSet(st)} className="flex min-h-tap w-full flex-col items-center gap-1 rounded-xl px-0.5 text-center" aria-current={i === idx ? 'step' : undefined}>
              <span className="relative flex w-full items-center justify-center">
                {i > 0 && <span className={`absolute right-1/2 top-1/2 h-1 w-full -translate-y-1/2 ${i <= idx ? 'bg-ok' : 'bg-line'}`} aria-hidden="true" />}
                <span className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${done ? 'border-ok bg-ok text-white' : 'border-line bg-white text-muted'}`}>
                  {done ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <span className="text-small">{i + 1}</span>}
                </span>
              </span>
              <span className={`text-[14px] leading-tight ${done ? 'font-semibold text-ok-text' : 'text-muted'}`}>{t(`steps.${st}`, lang)}</span>
              {history?.[st] && done && <span className="text-[13px] leading-tight text-muted">{fmtDate(history[st], lang)}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function AppCard({ id, app, lang, onUpdate, onRemove, onOpen }) {
  const s = SCHEMES.find((x) => x.id === id);
  const [ref, setRef] = useState(app.ref || '');
  if (!s) return null;
  const applied = app.status !== 'saved';
  const idx = STEPS.indexOf(app.status);
  const setStatus = (st) => onUpdate({ status: st, history: { ...(app.history || {}), [st]: app.history?.[st] || Date.now() } });
  return (
    <li className="rounded-3xl border border-line bg-white p-4">
      <button type="button" onClick={() => onOpen(id)} className="flex w-full items-start gap-3 text-left">
        <CategoryIcon category={s.category} />
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-bold leading-snug">{s.title[lang]}</span>
          <span className="block text-small text-muted">{s.officialName[lang]}</span>
        </span>
        <ChevronRight size={22} className="mt-2 text-muted" aria-hidden="true" />
      </button>

      {!applied ? (
        <>
          <p className="mt-3 text-small text-muted">{t('savedOnly', lang)}</p>
          <button type="button" onClick={() => setStatus('applied')} className="mt-2 flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 font-semibold text-white">
            <Check size={20} aria-hidden="true" /> {t('markApplied', lang)}
          </button>
        </>
      ) : (
        <>
          <Timeline status={app.status} history={app.history} lang={lang} onSet={setStatus} />
          {idx < STEPS.length - 1 && (
            <button type="button" onClick={() => setStatus(STEPS[idx + 1])} className="mt-2 flex min-h-tap w-full items-center justify-center rounded-2xl border-2 border-brand px-4 font-semibold text-brand">
              {t('nextStep', lang)}: {t(`steps.${STEPS[idx + 1]}`, lang)}
            </button>
          )}
          <label className="mt-3 block text-small font-semibold text-muted" htmlFor={`ref-${id}`}>{t('refNo', lang)}</label>
          <input
            id={`ref-${id}`}
            value={ref}
            onChange={(e) => setRef(e.target.value.slice(0, 30))}
            onBlur={() => onUpdate({ ref: ref.trim() })}
            inputMode="text"
            autoComplete="off"
            className="mt-1 min-h-tap w-full rounded-2xl border-2 border-line px-4 text-body outline-none focus:border-brand"
          />
          <p className="mt-1 text-[14px] text-muted">{t('refHint', lang)}</p>
        </>
      )}
      <button type="button" onClick={onRemove} className="mt-2 flex min-h-tap items-center gap-2 rounded-2xl px-1 font-semibold text-muted">
        <Trash2 size={18} aria-hidden="true" /> {t('remove', lang)}
      </button>
    </li>
  );
}

export function Apps({ lang, apps, onUpdate, onRemove, onOpen }) {
  const ids = Object.keys(apps).sort((a, b) => (apps[b].updated || 0) - (apps[a].updated || 0));
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-4 pt-4">
      <p className="flex items-start gap-2 rounded-2xl border-l-4 border-turmeric bg-white px-4 py-3 text-small">
        <Info size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" /> {t('demoTracker', lang)}
      </p>
      {ids.length === 0 ? (
        <p className="rounded-3xl border border-line bg-white p-5 text-muted">{t('emptyApps', lang)}</p>
      ) : (
        <ul className="space-y-3">
          {ids.map((id) => (
            <AppCard key={id} id={id} app={apps[id]} lang={lang} onUpdate={(patch) => onUpdate(id, patch)} onRemove={() => onRemove(id)} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </main>
  );
}

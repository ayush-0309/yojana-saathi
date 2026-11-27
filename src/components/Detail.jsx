import React from 'react';
import { Bookmark, BookmarkCheck, Share2, Volume2, ExternalLink, Check, Globe, Store, ShieldCheck, CircleHelp, X } from 'lucide-react';
import { t } from '../lib/i18n.js';
import { SCHEMES, evaluateScheme } from '../lib/engine.js';
import { speak } from '../lib/speech.js';
import { CategoryIcon } from './ui.jsx';
import { whyLines } from './Results.jsx';

export function detailSpeech(s, benefit, lang) {
  const L = (en, hi) => (lang === 'hi' ? hi : en);
  const parts = [
    `${s.title[lang]}. ${s.officialName[lang]}.`,
    `${benefit.spoken[lang]}.`,
    `${t('whoCanGet', lang)}: ${s.eligibility.map((e) => e[lang]).join('. ')}.`,
    s.exclusions.length ? `${t('notFor', lang)}: ${s.exclusions.map((e) => e[lang]).join(', ')}.` : '',
    `${t('documents', lang)}: ${s.documents.map((d) => d[lang]).join(', ')}.`,
    s.apply.online ? L(`Apply online at ${s.apply.online.label}.`, `ऑनलाइन आवेदन: ${s.apply.online.label}.`) : '',
    `${L('Or apply in person at', 'या ख़ुद जाकर')}: ${s.apply.offline.map((o) => o[lang]).join(L(', or ', ', या '))}.`,
    t('freeNote', lang),
  ];
  return parts.filter(Boolean).join(' ');
}

export function shareText(s, benefit, lang) {
  const L = (en, hi) => (lang === 'hi' ? hi : en);
  return [
    `*${s.title[lang]}*`,
    s.officialName[lang],
    `${L('Benefit', 'लाभ')}: ${benefit.short[lang]}`,
    `${t('whoCanGet', lang)}: ${s.eligibility.map((e) => e[lang]).join('; ')}`,
    `${t('documents', lang)}: ${s.documents.map((d) => d[lang]).join(', ')}`,
    s.apply.online ? `${L('Apply', 'आवेदन')}: ${s.apply.online.url}` : `${L('Apply at', 'आवेदन')}: ${s.apply.offline[0][lang]}`,
    t('freeNote', lang),
    `— ${t('appName', lang)}. ${t('footer', lang)}`,
  ].join('\n');
}

export function Detail({ lang, id, profile, saved, docs, onToggleDoc, onSave, onApplied }) {
  const s = SCHEMES.find((x) => x.id === id);
  if (!s) return null;
  const r = evaluateScheme(s, profile || {});
  const benefit = r.benefit || s.benefit;
  const status = r.status;
  const ticked = docs || [];
  const btn = 'flex min-h-tap flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-line bg-white px-2 py-1 text-small font-semibold text-brand';
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText(s, benefit, lang))}`;
  const showFit = profile && (status === 'eligible' || status === 'check');

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-8 pt-4">
      <section className="flex gap-3">
        <CategoryIcon category={s.category} tone={status === 'eligible' ? 'ok' : status === 'check' ? 'check' : 'brand'} />
        <div>
          <h2 className="text-[24px] font-bold leading-tight text-ink">{s.title[lang]}</h2>
          <p className="text-small text-muted">{s.officialName[lang]}</p>
        </div>
      </section>

      <p className="rounded-3xl bg-brand px-5 py-4 text-[20px] font-bold leading-snug text-white">{benefit.short[lang]}</p>

      <div className="flex gap-2">
        <button type="button" className={btn} onClick={() => speak(detailSpeech(s, benefit, lang), lang)}>
          <Volume2 size={24} aria-hidden="true" /> {t('readAloud', lang)}
        </button>
        <button type="button" className={btn} onClick={onSave} aria-pressed={!!saved}>
          {saved ? <BookmarkCheck size={24} aria-hidden="true" /> : <Bookmark size={24} aria-hidden="true" />}
          {saved ? t('saved', lang) : t('save', lang)}
        </button>
        <a className={btn} href={wa} target="_blank" rel="noopener noreferrer">
          <Share2 size={24} aria-hidden="true" /> {t('share', lang)}
        </a>
      </div>

      {showFit && (
        <section className={`rounded-3xl border-l-[6px] bg-white p-4 ${status === 'eligible' ? 'border-l-ok' : 'border-l-check'}`}>
          <h3 className={`font-bold ${status === 'eligible' ? 'text-ok-text' : 'text-check-text'}`}>{status === 'eligible' ? t('likely', lang) : t('checkOne', lang)}</h3>
          {status === 'check' && r.checks.map((c) => (
            <p key={c.field} className="mt-1 flex items-start gap-2 font-semibold text-check-text"><CircleHelp size={20} className="mt-0.5 shrink-0" aria-hidden="true" />{c.check[lang]}</p>
          ))}
          <ul className="mt-2 space-y-1">
            {whyLines(r, profile, lang).map((w) => (
              <li key={w.text} className="flex items-start gap-2 text-ok-text"><Check size={18} strokeWidth={3} className="mt-1 shrink-0" aria-hidden="true" /><span>{w.text}{w.assumed && <span className="text-muted"> ({t('assumed', lang)})</span>}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-[20px] font-bold text-brand">{t('whoCanGet', lang)}</h3>
        <ul className="space-y-2 rounded-3xl bg-white p-4">
          {s.eligibility.map((e) => (
            <li key={e.en} className="flex items-start gap-2"><Check size={20} className="mt-1 shrink-0 text-ok" strokeWidth={2.5} aria-hidden="true" />{e[lang]}</li>
          ))}
          {s.exclusions.length > 0 && (
            <li className="pt-2">
              <p className="font-semibold text-muted">{t('notFor', lang)}:</p>
              <ul className="mt-1 space-y-1">
                {s.exclusions.map((e) => <li key={e.en} className="flex items-start gap-2 text-muted"><X size={20} className="mt-1 shrink-0" aria-hidden="true" />{e[lang]}</li>)}
              </ul>
            </li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[20px] font-bold text-brand">{t('documents', lang)} <span className="text-small font-normal text-muted">({ticked.length}/{s.documents.length} {t('docsReady', lang)})</span></h3>
        <ul className="space-y-2">
          {s.documents.map((d, i) => {
            const on = ticked.includes(i);
            return (
              <li key={d.en}>
                <button type="button" role="checkbox" aria-checked={on} onClick={() => onToggleDoc(i)} className={`flex min-h-tap w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-2 text-left ${on ? 'border-ok' : 'border-line'}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 ${on ? 'border-ok bg-ok text-white' : 'border-line'}`} aria-hidden="true">{on && <Check size={20} strokeWidth={3} />}</span>
                  <span className={on ? 'text-ok-text' : ''}>{d[lang]}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-small text-muted">{t('privacy', lang)}</p>
      </section>

      <section>
        <h3 className="mb-2 text-[20px] font-bold text-brand">{t('howApply', lang)}</h3>
        <div className="space-y-3">
          <div className="rounded-3xl bg-white p-4">
            <h4 className="flex items-center gap-2 font-bold"><Globe size={22} className="text-brand" aria-hidden="true" /> {t('online', lang)}</h4>
            {s.apply.online ? (
              <>
                <ol className="mt-2 list-decimal space-y-1 pl-6">{s.apply.online.steps.map((st) => <li key={st.en}>{st[lang]}</li>)}</ol>
                <a href={s.apply.online.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-tap items-center justify-center gap-2 rounded-2xl bg-brand px-4 font-semibold text-white">
                  {t('openSite', lang)}: {s.apply.online.label} <ExternalLink size={18} aria-hidden="true" />
                </a>
              </>
            ) : <p className="mt-1 text-muted">{t('noOnline', lang)}</p>}
          </div>
          <div className="rounded-3xl bg-white p-4">
            <h4 className="flex items-center gap-2 font-bold"><Store size={22} className="text-brand" aria-hidden="true" /> {t('offline', lang)}</h4>
            <ul className="mt-2 space-y-1">{s.apply.offline.map((o) => <li key={o.en} className="flex items-start gap-2"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-turmeric" aria-hidden="true" />{o[lang]}</li>)}</ul>
          </div>
        </div>
      </section>

      <p className="flex items-start gap-3 rounded-3xl border-2 border-turmeric bg-white p-4 font-semibold">
        <ShieldCheck size={26} className="shrink-0 text-brand" aria-hidden="true" /> {t('freeNote', lang)}
      </p>

      <button type="button" onClick={onApplied} className="flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand bg-white px-4 text-[19px] font-semibold text-brand">
        <Check size={22} aria-hidden="true" /> {t('markApplied', lang)}
      </button>
    </main>
  );
}

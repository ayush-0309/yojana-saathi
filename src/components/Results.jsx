import React, { useState } from 'react';
import { ChevronRight, Check, CircleHelp, ChevronDown } from 'lucide-react';
import { t, moneyLine } from '../lib/i18n.js';
import { fill, inr } from '../lib/labels.js';
import { CategoryIcon, ReadAloudButton } from './ui.jsx';
import { UnderstoodCard } from './Understood.jsx';

export function whyLines(r, profile, lang) {
  return r.why.map((w) => ({ text: fill(w.cond.why[lang], profile, lang), assumed: w.assumed }));
}

function SchemeRow({ r, profile, lang, onOpen }) {
  const ok = r.status === 'eligible';
  const s = r.scheme;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(s.id)}
        className={`flex w-full gap-3 rounded-3xl border bg-white p-4 text-left ${ok ? 'border-line border-l-[6px] border-l-ok' : 'border-line border-l-[6px] border-l-check'}`}
      >
        <CategoryIcon category={s.category} tone={ok ? 'ok' : 'check'} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-bold leading-snug text-ink">{s.title[lang]}</h3>
          <p className="text-small leading-snug text-muted">{s.officialName[lang]}</p>
          <p className="mt-1 font-semibold text-brand">{r.benefit.short[lang]}</p>
          {!ok && r.checks[0] && (
            <p className="mt-2 flex items-start gap-2 rounded-2xl bg-check-bg px-3 py-2 text-small font-semibold text-check-text">
              <CircleHelp size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span><span className="sr-only">{t('checkOne', lang)}: </span>{r.checks[0].check[lang]}</span>
            </p>
          )}
          {r.why.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-small" aria-label={t('whyMatch', lang)}>
              {whyLines(r, profile, lang).map((w) => (
                <li key={w.text} className="flex items-start gap-1.5 text-ok-text">
                  <Check size={16} className="mt-1 shrink-0" strokeWidth={3} aria-hidden="true" />
                  <span>{w.text}{w.assumed && <span className="text-muted"> ({t('assumed', lang)})</span>}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ChevronRight size={24} className="mt-3 shrink-0 text-muted" aria-hidden="true" />
      </button>
    </li>
  );
}

export function Results({ lang, profile, summary, all, reply, onOpen, onEdit }) {
  const [showNo, setShowNo] = useState(false);
  const { eligible, check } = summary;
  const no = all.filter((r) => r.status === 'no');
  const money = moneyLine(summary, lang);
  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-4 pt-4">
      <section className="rounded-3xl bg-brand p-5 text-white" aria-label="Summary">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-[34px] font-bold leading-none">{eligible.length}</p>
            <p className="font-semibold">{t('likely', lang)}</p>
          </div>
          <ReadAloudButton text={reply} lang={lang} className="-mr-2 -mt-2 bg-white/10 text-white" />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <dt className="text-small opacity-90">{t('perYearCash', lang)}</dt>
            <dd className="text-[24px] font-bold">{inr(summary.cashYearly)}</dd>
            {summary.oneTime > 0 && <dd className="text-small">+ {inr(summary.oneTime)} {t('oneTime', lang)}</dd>}
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <dt className="text-small opacity-90">{t('insuranceCovers', lang)}</dt>
            <dd className="text-[24px] font-bold">{summary.insurance}</dd>
            {check.length > 0 && <dd className="text-small">{check.length} {t('toCheck', lang)}</dd>}
          </div>
        </dl>
        {money && <p className="sr-only">{money}</p>}
      </section>

      <UnderstoodCard profile={profile} lang={lang} onChange={onEdit} compact />

      {eligible.length === 0 && check.length === 0 && (
        <p className="rounded-3xl border border-line bg-white p-4">{t('noResults', lang)}</p>
      )}

      {eligible.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-[20px] font-bold text-ok-text">
            <span className="h-3 w-3 rounded-full bg-ok" aria-hidden="true" /> {t('likely', lang)} ({eligible.length})
          </h2>
          <ul className="space-y-3">{eligible.map((r) => <SchemeRow key={r.scheme.id} r={r} profile={profile} lang={lang} onOpen={onOpen} />)}</ul>
        </section>
      )}

      {check.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-[20px] font-bold text-check-text">
            <span className="h-3 w-3 rounded-full bg-check" aria-hidden="true" /> {t('checkOne', lang)} ({check.length})
          </h2>
          <ul className="space-y-3">{check.map((r) => <SchemeRow key={r.scheme.id} r={r} profile={profile} lang={lang} onOpen={onOpen} />)}</ul>
        </section>
      )}

      {no.length > 0 && (
        <section>
          <button type="button" onClick={() => setShowNo((v) => !v)} aria-expanded={showNo} className="flex min-h-tap w-full items-center justify-between rounded-2xl px-1 font-semibold text-muted">
            {t('notMatched', lang)} ({no.length}) <ChevronDown size={22} className={showNo ? 'rotate-180' : ''} aria-hidden="true" />
          </button>
          {showNo && (
            <ul className="space-y-2">
              {no.map((r) => (
                <li key={r.scheme.id} className="rounded-2xl border border-line bg-white px-4 py-3">
                  <p className="font-semibold">{r.scheme.title[lang]}</p>
                  <p className="text-small text-muted">{t('whoCanGet', lang)}: {r.scheme.eligibility[0][lang]}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="rounded-2xl bg-white px-4 py-3 text-small text-muted">{t('freeNote', lang)}</p>
    </main>
  );
}

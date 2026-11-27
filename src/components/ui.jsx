import { useEffect, useRef } from 'react';
import { ChevronLeft, PersonStanding, PiggyBank, Wheat, ShieldCheck, HeartPulse, HandCoins, IdCard, CreditCard, Baby, ShoppingBasket, Square, Volume2, X } from 'lucide-react';
import { t } from '../lib/i18n.js';
import { useSpeaking, stopSpeaking, speak } from '../lib/speech.js';

export const CATEGORY_ICON = {
  farming: Wheat, insurance: ShieldCheck, health: HeartPulse, pension: HandCoins,
  worker: IdCard, loan: CreditCard, mother: Baby, ration: ShoppingBasket, elder: PersonStanding, savings: PiggyBank,
};

export function CategoryIcon({ category, tone = 'brand', size = 26 }) {
  const Icon = CATEGORY_ICON[category] || ShieldCheck;
  const tones = {
    brand: 'bg-brand-soft text-brand',
    ok: 'bg-ok-bg text-ok',
    check: 'bg-check-bg text-check',
  };
  return (
    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`} aria-hidden="true">
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

export function LangSwitch({ lang, setLang }) {
  const opt = (code, label) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
      className={`min-h-tap px-3 rounded-xl text-small font-semibold transition-colors ${lang === code ? 'bg-brand text-white' : 'text-brand'}`}
      lang={code}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Language / भाषा" className="flex rounded-2xl border border-line bg-white p-0.5">
      {opt('hi', 'हिंदी')}
      {opt('en', 'English')}
    </div>
  );
}

export function Header({ lang, setLang, title, onBack, right }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-2">
        {onBack ? (
          <button type="button" onClick={onBack} className="-ml-2 flex min-h-tap min-w-tap items-center justify-center rounded-2xl text-brand" aria-label={t('back', lang)}>
            <ChevronLeft size={30} strokeWidth={2} />
          </button>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-turmeric text-ink" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-bold leading-tight text-brand">{title || t('appName', lang)}</h1>
          {!onBack && <p className="truncate text-small leading-tight text-muted">{t('tagline', lang)}</p>}
        </div>
        {right}
        {setLang && <LangSwitch lang={lang} setLang={setLang} />}
      </div>
    </header>
  );
}

export function Footer({ lang }) {
  return (
    <footer className="mx-auto max-w-md px-4 pb-6 pt-4 text-center text-small text-muted">
      <p className="font-semibold">{t('footer', lang)}</p>
      <p>{t('privacy', lang)}</p>
      <p className="mt-1 text-[14px]">{t('dataAsOf', lang)}</p>
    </footer>
  );
}

/** Floating "Speaking… Stop" control, shown whenever the app is talking. */
export function SpeakingPill({ lang, bottom = 'bottom-[136px]' }) {
  const speaking = useSpeaking();
  if (!speaking) return null;
  return (
    <div className={`fixed inset-x-0 ${bottom} z-40 flex justify-center px-4`}>
      <button
        type="button"
        onClick={stopSpeaking}
        className="flex min-h-tap items-center gap-3 rounded-full bg-ink px-5 text-white shadow-lg"
      >
        <Volume2 size={22} aria-hidden="true" />
        <span>{t('speaking', lang)}</span>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-semibold">
          <Square size={16} fill="currentColor" aria-hidden="true" /> {t('stop', lang)}
        </span>
      </button>
    </div>
  );
}

export function ReadAloudButton({ text, lang, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => speak(text, lang)}
      className={`inline-flex min-h-tap min-w-tap items-center justify-center gap-2 rounded-2xl text-brand ${className}`}
      aria-label={label || t('readAloud', lang)}
    >
      <Volume2 size={24} aria-hidden="true" />
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
}

export function Sheet({ title, onClose, children, lang }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pb-safe max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 outline-none"
      >
        <div className="mb-2 flex items-center gap-2">
          <h2 className="flex-1 text-[20px] font-bold text-brand">{title}</h2>
          <button type="button" onClick={onClose} className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl text-muted" aria-label={t('back', lang)}>
            <X size={26} />
          </button>
        </div>
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}

export function OptionButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!selected}
      className={`flex min-h-tap w-full items-center gap-3 rounded-2xl border-2 px-4 py-2 text-left text-body ${selected ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line bg-white text-ink'}`}
    >
      {children}
    </button>
  );
}

import { ChevronRight } from 'lucide-react';
import { t } from '../lib/i18n.js';
import { SCHEMES } from '../lib/engine.js';
import { CategoryIcon } from './ui.jsx';

export function Browse({ lang, onOpen }) {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-4 pt-4">
      <p className="text-muted">{t('browseIntro', lang)}</p>
      <ul className="space-y-3">
        {SCHEMES.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onOpen(s.id)} className="flex w-full items-start gap-3 rounded-3xl border border-line bg-white p-4 text-left">
              <CategoryIcon category={s.category} />
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-bold leading-snug text-ink">{s.title[lang]}</span>
                <span className="block text-small leading-snug text-muted">{s.officialName[lang]}</span>
                <span className="mt-1 block font-semibold text-brand">{s.benefit.short[lang]}</span>
              </span>
              <ChevronRight size={24} className="mt-3 shrink-0 text-muted" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

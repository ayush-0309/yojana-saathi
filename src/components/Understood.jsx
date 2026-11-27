import { useState } from 'react';
import { MapPin, Briefcase, CalendarDays, User, Users, Sprout, Wallet, HeartHandshake, Plus, Pencil, Minus } from 'lucide-react';
import { t } from '../lib/i18n.js';
import { STATES, OCCUPATIONS, SUBJECTS, GENDERS, CHILD_ORDER, INCOME_CHOICES, incomeText, landText, ageText, stateText } from '../lib/labels.js';
import { Sheet, OptionButton } from './ui.jsx';

const L = (lang, en, hi) => (lang === 'hi' ? hi : en);

function situationText(p, lang) {
  const out = [];
  if (p.pregnant) out.push(L(lang, 'Pregnant', 'गर्भवती'));
  if ((p.pregnant || p.recentBirth) && p.childOrder) out.push(CHILD_ORDER[p.childOrder][lang]);
  if (p.recentBirth) out.push(L(lang, 'New baby', 'नया बच्चा'));
  if (p.hasDaughter) out.push(p.daughterAge !== undefined && p.daughterAge > 0 ? L(lang, `Daughter, ${p.daughterAge} years`, `बेटी, ${p.daughterAge} साल`) : p.recentBirth ? L(lang, 'Newborn daughter', 'नवजात बेटी') : L(lang, 'Has a daughter', 'बेटी है'));
  if (p.widow) out.push(L(lang, 'Widow', 'विधवा'));
  if (p.migrant && p.homeState) out.push(L(lang, `From ${STATES[p.homeState]?.en}`, `${STATES[p.homeState]?.hi} से`));
  else if (p.migrant) out.push(L(lang, 'Working away from home', 'घर से दूर काम'));
  if (p.hasRationCard === true) out.push(L(lang, 'Has ration card', 'राशन कार्ड है'));
  if (p.hasRationCard === false) out.push(L(lang, 'No ration card', 'राशन कार्ड नहीं'));
  if (p.epf) out.push('EPF / ESIC');
  if (p.taxPayer) out.push(L(lang, 'Pays income tax', 'इनकम टैक्स भरते हैं'));
  return out.join(' · ');
}

export function chipList(p, lang) {
  const chips = [];
  if (p.subject && p.subject !== 'self') chips.push({ field: 'subject', icon: Users, text: SUBJECTS[p.subject][lang] });
  chips.push({ field: 'state', icon: MapPin, text: stateText(p, lang), label: L(lang, 'State', 'राज्य') });
  chips.push({ field: 'occupation', icon: Briefcase, text: OCCUPATIONS[p.occupation]?.[lang], label: L(lang, 'Work', 'काम') });
  chips.push({ field: 'age', icon: CalendarDays, text: p.age !== undefined ? ageText(p.age, lang) : '', label: L(lang, 'Age', 'उम्र') });
  chips.push({ field: 'gender', icon: User, text: GENDERS[p.gender]?.[lang], label: L(lang, 'Gender', 'लिंग') });
  if (p.occupation === 'farmer' || p.hasLand !== undefined) chips.push({ field: 'land', icon: Sprout, text: landText(p, lang), label: L(lang, 'Land', 'ज़मीन') });
  chips.push({ field: 'incomeMonthly', icon: Wallet, text: incomeText(p.incomeMonthly, lang), label: L(lang, 'Income', 'कमाई') });
  chips.push({ field: 'situation', icon: HeartHandshake, text: situationText(p, lang), label: L(lang, 'Situation', 'स्थिति') });
  return chips;
}

/** Spoken/written one-liner of what was understood. */
export function understoodLine(p, lang) {
  return chipList(p, lang).filter((c) => c.text).map((c) => c.text).join(', ');
}

export function UnderstoodCard({ profile, lang, onChange, editable = true, compact = false, collapsible = false }) {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(!collapsible);
  const chips = chipList(profile, lang);
  const line = understoodLine(profile, lang);
  if (!open) {
    if (!line) return null;
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-tap w-full items-center gap-2 rounded-2xl border border-dashed border-line bg-white/60 px-4 py-2 text-left text-small text-muted">
        <span className="flex-1"><span className="font-semibold text-ink">{t('understoodShort', lang)}:</span> {line}</span>
        <span className="flex items-center gap-1 font-semibold text-brand"><Pencil size={14} aria-hidden="true" /> {t('edit', lang)}</span>
      </button>
    );
  }
  return (
    <section aria-label={t('understood', lang)} className={`rounded-3xl border border-line bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <h3 className="text-small font-semibold uppercase tracking-wide text-muted">{t('understood', lang)}</h3>
      {editable && <p className="mb-2 text-small text-muted">{t('tapToChange', lang)}</p>}
      <ul className="mt-1 flex flex-wrap gap-2">
        {chips.map((c) => {
          const Icon = c.icon;
          const known = !!c.text;
          if (!known && !editable) return null;
          return (
            <li key={c.field}>
              <button
                type="button"
                disabled={!editable}
                onClick={() => setEditing(c.field)}
                className={`flex min-h-tap items-center gap-2 rounded-2xl px-3 py-1.5 text-left ${known ? 'bg-brand-soft text-brand font-semibold' : 'border-2 border-dashed border-line text-muted'}`}
                aria-label={known ? `${c.label || ''} ${c.text}` : `${t('add', lang)} ${c.label}`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{known ? c.text : c.label}</span>
                {editable && (known ? <Pencil size={14} aria-hidden="true" className="opacity-60" /> : <Plus size={16} aria-hidden="true" />)}
              </button>
            </li>
          );
        })}
      </ul>
      {editing && (
        <FieldSheet
          field={editing}
          profile={profile}
          lang={lang}
          onClose={() => setEditing(null)}
          onSave={(delta) => { setEditing(null); onChange?.(delta, editing); }}
        />
      )}
    </section>
  );
}

export function Stepper({ value, onChange, min = 0, max = 120, step = 1, big = 5, unit }) {
  const v = value ?? 40;
  const set = (n) => onChange(Math.max(min, Math.min(max, Math.round(n * 100) / 100)));
  const btn = 'flex h-14 min-w-[56px] items-center justify-center rounded-2xl border-2 border-line bg-white font-semibold text-brand';
  return (
    <div role="group" aria-label={unit}>
      <output className="block text-center text-[36px] font-bold leading-none text-ink" aria-live="polite">
        {v} <span className="text-body font-normal text-muted">{unit}</span>
      </output>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <button type="button" className={btn} onClick={() => set(v - big)} aria-label={`−${big}`}>−{big}</button>
        <button type="button" className={btn} onClick={() => set(v - step)} aria-label={`−${step}`}><Minus size={22} /></button>
        <button type="button" className={btn} onClick={() => set(v + step)} aria-label={`+${step}`}><Plus size={22} /></button>
        <button type="button" className={btn} onClick={() => set(v + big)} aria-label={`+${big}`}>+{big}</button>
      </div>
    </div>
  );
}

const Primary = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="mt-4 flex min-h-tap w-full items-center justify-center rounded-2xl bg-brand px-4 text-[19px] font-semibold text-white">
    {children}
  </button>
);
const Secondary = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="mt-2 flex min-h-tap w-full items-center justify-center rounded-2xl px-4 font-semibold text-brand">
    {children}
  </button>
);

export function FieldSheet({ field, profile, lang, onSave, onClose }) {
  const [age, setAge] = useState(typeof profile.age === 'number' ? profile.age : profile.age?.min ? profile.age.min + 5 : 40);
  const [acres, setAcres] = useState(profile.landAcres ?? 1);
  const [sit, setSit] = useState({
    pregnant: !!profile.pregnant, childOrder: profile.childOrder, widow: !!profile.widow,
    recentBirth: !!profile.recentBirth, hasDaughter: !!profile.hasDaughter,
    migrant: !!profile.migrant, hasRationCard: profile.hasRationCard, epf: !!profile.epf, taxPayer: !!profile.taxPayer,
  });
  const clear = (keys) => onSave(Object.fromEntries(keys.map((k) => [k, undefined])));
  const titles = {
    subject: L(lang, 'Who is this for?', 'किसके लिए?'), state: L(lang, 'Which state do you live in?', 'किस राज्य में रहते हैं?'),
    occupation: L(lang, 'What work?', 'क्या काम?'), age: L(lang, 'Age', 'उम्र'), gender: L(lang, 'Gender', 'लिंग'),
    land: L(lang, 'Farm land', 'खेती की ज़मीन'), incomeMonthly: L(lang, 'Monthly income', 'महीने की कमाई'), situation: L(lang, 'Situation', 'स्थिति'),
  };

  let body;
  if (field === 'subject') {
    body = <div className="grid gap-2">{Object.entries(SUBJECTS).map(([k, v]) => (
      <OptionButton key={k} selected={(profile.subject || 'self') === k} onClick={() => onSave({ subject: k })}>{v[lang]}</OptionButton>
    ))}</div>;
  } else if (field === 'state') {
    const order = ['haryana', 'bihar', 'delhi', 'uttar_pradesh', 'rajasthan', 'punjab', 'madhya_pradesh', 'maharashtra'];
    const rest = Object.keys(STATES).filter((k) => !order.includes(k)).sort((a, b) => STATES[a][lang].localeCompare(STATES[b][lang]));
    body = <div className="grid grid-cols-2 gap-2">{[...order, ...rest].map((k) => (
      <OptionButton key={k} selected={profile.state === k} onClick={() => onSave({ state: k, city: profile.state === k ? profile.city : undefined })}>{STATES[k][lang]}</OptionButton>
    ))}</div>;
  } else if (field === 'occupation') {
    body = <div className="grid gap-2">{Object.entries(OCCUPATIONS).map(([k, v]) => (
      <OptionButton key={k} selected={profile.occupation === k} onClick={() => onSave({ occupation: k })}>{v[lang]}</OptionButton>
    ))}<Secondary onClick={() => clear(['occupation'])}>{t('dontKnow', lang)}</Secondary></div>;
  } else if (field === 'age') {
    body = <div>
      <Stepper value={age} onChange={setAge} min={1} max={110} unit={L(lang, 'years', 'साल')} lang={lang} />
      <Primary onClick={() => onSave({ age })}>{t('done', lang)}</Primary>
      <Secondary onClick={() => clear(['age'])}>{t('dontKnow', lang)}</Secondary>
    </div>;
  } else if (field === 'gender') {
    body = <div className="grid gap-2">{Object.entries(GENDERS).map(([k, v]) => (
      <OptionButton key={k} selected={profile.gender === k} onClick={() => onSave({ gender: k })}>{v[lang]}</OptionButton>
    ))}<Secondary onClick={() => clear(['gender'])}>{t('dontKnow', lang)}</Secondary></div>;
  } else if (field === 'land') {
    body = <div className="grid gap-2">
      <OptionButton selected={profile.hasLand === false} onClick={() => onSave({ hasLand: false, landAcres: undefined, landBigha: undefined })}>{L(lang, 'No land in family name', 'परिवार के नाम ज़मीन नहीं')}</OptionButton>
      <p className="mt-2 text-small text-muted">{L(lang, 'Land in family name (acres):', 'परिवार के नाम ज़मीन (एकड़):')}</p>
      <Stepper value={acres} onChange={setAcres} min={0.5} max={500} step={0.5} big={5} unit={L(lang, 'acres', 'एकड़')} lang={lang} />
      <Primary onClick={() => onSave({ hasLand: true, landAcres: acres, landBigha: undefined })}>{t('done', lang)}</Primary>
      <Secondary onClick={() => clear(['hasLand', 'landAcres', 'landBigha'])}>{t('dontKnow', lang)}</Secondary>
    </div>;
  } else if (field === 'incomeMonthly') {
    body = <div className="grid gap-2">
      {typeof profile.incomeMonthly === 'number' && profile.incomeMonthly > 0 && (
        <OptionButton selected onClick={onClose}>{incomeText(profile.incomeMonthly, lang)}</OptionButton>
      )}
      {INCOME_CHOICES.map((c) => (
        <OptionButton key={c[lang]} selected={JSON.stringify(profile.incomeMonthly) === JSON.stringify(c.value)} onClick={() => onSave({ incomeMonthly: c.value })}>{c[lang]}</OptionButton>
      ))}
      <Secondary onClick={() => clear(['incomeMonthly'])}>{t('dontKnow', lang)}</Secondary>
    </div>;
  } else if (field === 'situation') {
    const toggle = (k) => setSit((s) => ({ ...s, [k]: !s[k] }));
    body = <div className="grid gap-2">
      <OptionButton selected={sit.pregnant} onClick={() => toggle('pregnant')}>{L(lang, 'Pregnant', 'गर्भवती')}</OptionButton>
      {(sit.pregnant || sit.recentBirth) && (
        <div className="grid grid-cols-3 gap-2 pl-4">
          {[1, 2, 3].map((n) => (
            <OptionButton key={n} selected={sit.childOrder === n} onClick={() => setSit((s) => ({ ...s, childOrder: n }))}>{CHILD_ORDER[n][lang]}</OptionButton>
          ))}
        </div>
      )}
      <OptionButton selected={sit.recentBirth} onClick={() => toggle('recentBirth')}>{L(lang, 'New baby in the family', 'परिवार में नया बच्चा')}</OptionButton>
      <OptionButton selected={sit.hasDaughter} onClick={() => toggle('hasDaughter')}>{L(lang, 'Has a daughter below 10', '10 साल से छोटी बेटी है')}</OptionButton>
      <OptionButton selected={sit.widow} onClick={() => toggle('widow')}>{L(lang, 'Widow', 'विधवा')}</OptionButton>
      <OptionButton selected={sit.migrant} onClick={() => toggle('migrant')}>{L(lang, 'Working away from home state', 'अपने राज्य से बाहर काम')}</OptionButton>
      <OptionButton selected={sit.hasRationCard === true} onClick={() => setSit((s) => ({ ...s, hasRationCard: s.hasRationCard === true ? undefined : true }))}>{L(lang, 'Has a ration card', 'राशन कार्ड है')}</OptionButton>
      <OptionButton selected={sit.epf} onClick={() => toggle('epf')}>{L(lang, 'In EPF / ESIC (PF is cut from salary)', 'EPF / ESIC में (तनख्वाह से PF कटता है)')}</OptionButton>
      <OptionButton selected={sit.taxPayer} onClick={() => toggle('taxPayer')}>{L(lang, 'Pays income tax', 'इनकम टैक्स भरते हैं')}</OptionButton>
      <Primary onClick={() => onSave({
        ...sit,
        gender: sit.pregnant || sit.widow ? 'female' : profile.gender,
        childOrder: sit.pregnant || sit.recentBirth ? sit.childOrder : undefined,
        daughterAge: sit.hasDaughter ? (profile.daughterAge ?? (sit.recentBirth ? 0 : undefined)) : undefined,
        girlChild: sit.hasDaughter && sit.recentBirth ? true : profile.girlChild,
        homeState: sit.migrant ? profile.homeState : profile.state,
      })}>{t('done', lang)}</Primary>
    </div>;
  }
  return <Sheet title={titles[field]} onClose={onClose} lang={lang}>{body}</Sheet>;
}

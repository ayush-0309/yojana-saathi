import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from './lib/i18n.js';
import { handleUtterance, answerDirect, initialConv, recompute, startWith } from './lib/conversation.js';
import { evaluateAll, summarize, selectShown, SCHEMES } from './lib/engine.js';
import { listenOnce, canListen, speak, stopSpeaking } from './lib/speech.js';
import { useStored } from './lib/storage.js';
import { Header, Footer, SpeakingPill } from './components/ui.jsx';
import { Home, BottomBar } from './components/Home.jsx';
import { Results } from './components/Results.jsx';
import { Detail } from './components/Detail.jsx';
import { Apps } from './components/Apps.jsx';
import { Call } from './components/Call.jsx';
import { Browse } from './components/Browse.jsx';

let nextId = 1;
const withId = (m) => ({ ...m, id: nextId++ });

/** Apply a chip edit: set or clear fields directly. */
function applyEdit(p, delta) {
  const out = { ...p, ...delta };
  if ('state' in delta && !out.migrant) out.homeState = delta.state;
  if (delta.migrant === false) out.homeState = out.state;
  out.skipped = (p.skipped || []).filter((f) => !(f in delta));
  if (delta.hasLand !== undefined && 'land' in out) delete out.land;
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

export default function App() {
  const [lang, setLang] = useStored('yf.lang', 'hi');
  const [apps, setApps] = useStored('yf.apps', {});
  const [docs, setDocs] = useStored('yf.docs', {});
  const [view, setView] = useState({ name: 'home' });
  const [conv, setConv] = useState(initialConv);
  const [messages, setMessages] = useState([]);
  const [lastReply, setLastReply] = useState('');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [thinking, setThinking] = useState(false);
  const [micError, setMicError] = useState(canListen ? null : 'unsupported');
  const recRef = useRef(null);
  const convRef = useRef(conv);
  convRef.current = conv;

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // ---- navigation with the phone's back button ----
  const go = useCallback((v) => {
    stopSpeaking();
    window.history.pushState(v, '');
    setView(v);
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [view]);
  const back = useCallback(() => window.history.back(), []);
  useEffect(() => {
    window.history.replaceState({ name: 'home' }, '');
    const onPop = (e) => { stopSpeaking(); setView(e.state || { name: 'home' }); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ---- conversation ----
  // Answers stay in the chat; the full results page is one tap away.
  const deliver = useCallback((r, { userText } = {}) => {
    setConv(r.conv);
    setMessages((ms) => [...ms, ...(userText ? [withId({ role: 'user', text: userText })] : []), withId(r.message)]);
    if (r.summary) setLastReply(r.message.text);
    speak(r.message.speech, lang);
  }, [lang]);

  const send = useCallback(async (text, opts = {}) => {
    setMicError((e) => (e === 'no-speech' ? null : e));
    setMessages((ms) => [...ms, withId({ role: 'user', text })]);
    setThinking(true);
    const r = await handleUtterance(convRef.current, text, lang, opts);
    setThinking(false);
    deliver(r);
  }, [lang, deliver]);

  const persona = useCallback((p) => {
    stopSpeaking();
    deliver(startWith(p.delta, lang, p.topics || []), { userText: p[lang] });
  }, [lang, deliver]);

  const answer = useCallback((value, label) => {
    const c = convRef.current;
    if (!c.suggest) return;
    deliver(answerDirect(c, c.suggest, value, lang), { userText: label });
  }, [lang, deliver]);

  const toggleMic = useCallback(() => {
    if (listening) { recRef.current?.stop(); return; }
    if (!canListen) { setMicError('unsupported'); return; }
    stopSpeaking();
    setInterim('');
    setMicError(null);
    setListening(true);
    recRef.current = listenOnce({
      lang,
      onInterim: setInterim,
      onError: (err) => { if (err !== 'aborted') setMicError(err === 'not-allowed' || err === 'service-not-allowed' ? 'not-allowed' : err === 'no-speech' ? 'no-speech' : 'unsupported'); },
      onEnd: (finalText) => {
        setListening(false);
        setInterim('');
        if (finalText) send(finalText);
      },
    });
    if (view.name !== 'home') go({ name: 'home' });
  }, [listening, lang, send, view.name, go]);

  const edit = useCallback((delta) => {
    const c = convRef.current;
    const profile = applyEdit(c.profile, delta);
    if (c.phase === 'results') {
      const r = recompute(profile, lang, c.topics);
      setConv({ ...r.conv, asked: c.asked, suggest: null });
      setLastReply(r.message.text);
      setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 && m.role === 'bot' ? { ...m, understood: profile, text: r.message.text, speech: r.message.speech, suggest: null } : m)));
      return;
    }
    setConv({ ...c, profile });
    setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 && m.role === 'bot' ? { ...m, understood: profile } : m)));
  }, [lang]);

  const reset = useCallback(() => { stopSpeaking(); setConv(initialConv()); setMessages([]); setLastReply(''); }, []);

  // switching language mid-way: rephrase nothing, just speak/display new UI strings
  const changeLang = (l) => { stopSpeaking(); setLang(l); };

  // ---- results ----
  const all = useMemo(() => evaluateAll(conv.profile, conv.topics), [conv.profile, conv.topics]);
  const summary = useMemo(() => summarize(selectShown(all)), [all]);
  const reply = useMemo(() => (conv.phase === 'results' ? recompute(conv.profile, lang, conv.topics).message.speech : lastReply), [conv, lang, lastReply]);

  // ---- saved / applied ----
  const toggleSave = (id) => setApps((a) => {
    const n = { ...a };
    if (n[id]) delete n[id]; else n[id] = { status: 'saved', ref: '', history: {}, updated: Date.now() };
    return n;
  });
  const markApplied = (id) => {
    setApps((a) => ({ ...a, [id]: { ...(a[id] || { ref: '' }), status: 'applied', history: { ...(a[id]?.history || {}), applied: a[id]?.history?.applied || Date.now() }, updated: Date.now() } }));
    go({ name: 'apps' });
  };
  const updateApp = (id, patch) => setApps((a) => ({ ...a, [id]: { ...a[id], ...patch, updated: Date.now() } }));
  const removeApp = (id) => setApps((a) => { const n = { ...a }; delete n[id]; return n; });
  const toggleDoc = (id, i) => setDocs((d) => {
    const cur = d[id] || [];
    return { ...d, [id]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] };
  });

  const appsCount = Object.keys(apps).length;
  const showBar = view.name === 'home' || view.name === 'results';

  let screen;
  if (view.name === 'results') {
    screen = <>
      <Header lang={lang} setLang={changeLang} title={lang === 'hi' ? 'आपकी योजनाएँ' : 'Your schemes'} onBack={back} />
      <Results lang={lang} profile={conv.profile} summary={summary} all={all} reply={reply} onOpen={(id) => go({ name: 'detail', id })} onEdit={edit} />
    </>;
  } else if (view.name === 'detail') {
    const s = SCHEMES.find((x) => x.id === view.id);
    screen = <>
      <Header lang={lang} setLang={changeLang} title={s?.officialName[lang].split(' (')[0]} onBack={back} />
      <Detail
        lang={lang}
        id={view.id}
        profile={conv.phase === 'results' ? conv.profile : null}
        saved={!!apps[view.id]}
        docs={docs[view.id]}
        onToggleDoc={(i) => toggleDoc(view.id, i)}
        onSave={() => toggleSave(view.id)}
        onApplied={() => markApplied(view.id)}
      />
    </>;
  } else if (view.name === 'all') {
    screen = <>
      <Header lang={lang} setLang={changeLang} title={t('allSchemes', lang)} onBack={back} />
      <Browse lang={lang} onOpen={(id) => go({ name: 'detail', id })} />
    </>;
  } else if (view.name === 'apps') {
    screen = <>
      <Header lang={lang} setLang={changeLang} title={t('myApps', lang)} onBack={back} />
      <Apps lang={lang} apps={apps} onUpdate={updateApp} onRemove={removeApp} onOpen={(id) => go({ name: 'detail', id })} onClearAll={() => { setApps({}); setDocs({}); }} />
    </>;
  } else if (view.name === 'call') {
    screen = <>
      <Header lang={lang} setLang={changeLang} title={t('callMode', lang)} onBack={back} />
      <Call lang={lang} onResults={(r) => { setConv(r.conv); setLastReply(r.message.text); }} />
    </>;
  } else {
    screen = <>
      <Header lang={lang} setLang={changeLang} />
      <Home
        lang={lang}
        messages={messages}
        interim={interim}
        listening={listening}
        thinking={thinking}
        micError={micError}
        onSend={send}
        onPersona={persona}
        onOpenScheme={(id) => go({ name: 'detail', id })}
        onBrowse={() => go({ name: 'all' })}
        onAnswer={answer}
        onEdit={edit}
        onSeeResults={() => go({ name: 'results' })}
        onReset={reset}
      />
    </>;
  }

  return (
    <div className={`min-h-screen ${showBar ? 'pb-36' : ''}`}>
      {screen}
      {view.name !== 'call' && <Footer lang={lang} />}
      <SpeakingPill lang={lang} bottom={showBar ? 'bottom-[124px]' : view.name === 'call' ? 'bottom-[200px]' : 'bottom-6'} />
      {showBar && (
        <BottomBar lang={lang} listening={listening} onMic={toggleMic} onApps={() => go({ name: 'apps' })} onCall={() => go({ name: 'call' })} appsCount={appsCount} />
      )}
    </div>
  );
}

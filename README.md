# Yojana साथी (Yojana Saathi)

A voice-first, mobile-first prototype that helps people in India find government schemes they likely qualify for by describing their situation aloud in Hindi, Hinglish or English. It runs entirely in the browser, needs no login and no backend.

## Run

### One command (Docker)

```bash
docker compose up --build
```

Then open http://localhost:8080. No API keys or environment variables are needed: the app is a static site served by nginx.

### Without Docker (Node 18+)

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # parser + eligibility tests for all four demo scenarios, in Hindi and English
npm run build
```

### Voice notes

Speech input uses the Web Speech API (`hi-IN` / `en-IN`), which works in Chrome and Edge. Browsers only allow the microphone on `https://` or `localhost`, so open the app on `localhost` (or behind HTTPS) to speak. Everywhere else, or when the mic is missing or blocked, the app falls back to a text box and tappable example sentences, and call mode offers tappable caller lines — every scenario still works end to end.

No secret keys are used. The optional LLM extractor (below) stays off unless `VITE_LLM_EXTRACT_URL` is set at build time; without it the built-in Hindi/Hinglish/English parser handles everything.

## How it works

| Piece | File |
| --- | --- |
| Seed data: schemes, machine-readable rules, documents, official links | `src/data/schemes.json` |
| Rule-based extractor for Devanagari Hindi, Hinglish and English (number words, lakh/hazaar, acres/killa/bigha, states and cities, “from X in Y”, verb gender, negation) | `src/lib/parser.js` |
| Eligibility engine: `relevance` hides a scheme, `rules` decide eligible / check one thing / not a match; picks at most three follow-up questions | `src/lib/engine.js` |
| Conversation state shared by chat and call mode | `src/lib/conversation.js` |
| Reply phrasing (only uses names and amounts from the seed data) and UI strings | `src/lib/i18n.js` |
| Speech in and out, with Stop | `src/lib/speech.js` |
| Optional LLM extraction through your own proxy (`VITE_LLM_EXTRACT_URL`); output is validated against an allowlist | `src/lib/llm.js` |

Saved schemes, document ticks and the demo application tracker live in `localStorage`. Nothing is submitted anywhere.

### Adding a scheme

Add an entry to `schemes.json`. Each rule is `{ field, op, value, why, check, ask? , assumeIfUnknown? }`:

- `ask: true` lets the app ask a follow-up when the field is unknown.
- `assumeIfUnknown: true` is for exclusions (for example “not an income-tax payer”): the scheme stays green, and the reason is shown as “assumed”.
- Otherwise an unknown field puts the scheme under “Check one thing” with the `check` text.

Fields: `age`, `incomeMonthly` (number or `{min,max}`), `occupation`, `unorganised`, `state`, `homeState`, `migrant`, `hasLand`, `pregnant`, `childOrder`, `girlChild`, `widow`, `hasRationCard`, `taxPayer`, `epf`, `gender`.

## Trust

Independent helper. Confirm on the official portal before applying. The app never asks for an Aadhaar number, OTP or bank details, and reminds people that applying is free and needs no agent. Amounts and rules should be re-checked against the official portals before any real-world use.

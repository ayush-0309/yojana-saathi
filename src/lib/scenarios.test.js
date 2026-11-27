import { describe, it, expect } from 'vitest';
import { handleUtterance, initialConv } from './conversation.js';
import { parseUtterance } from './parser.js';
import { EXAMPLES } from './i18n.js';

const ids = (list) => list.map((r) => r.scheme.id).sort();

async function run(lines, lang) {
  let conv = initialConv();
  let last;
  const offered = [];
  for (const [i, line] of lines.entries()) {
    last = await handleUtterance(conv, line, lang, { fresh: i === 0 });
    conv = last.conv;
    offered.push(conv.suggest);
  }
  return { ...last, offered };
}

describe.each(['hi', 'en'])('scenarios in %s', (lang) => {
  it('farmer in Haryana: farm schemes at once, age offered (not required)', async () => {
    for (const s of [EXAMPLES.hi[0], EXAMPLES.en[0], 'Main Haryana ka kisan hoon, mere paas do ekad zameen hai']) {
      const first = await run([s], lang);
      expect(ids(first.summary.eligible)).toEqual(['kcc', 'pm-kisan', 'pmfby']);
      expect(first.conv.suggest).toBe('age');
      const r = await run([s, lang === 'hi' ? 'पैंतालीस साल' : '45'], lang);
      expect(ids(r.summary.eligible)).toEqual(['kcc', 'pm-kisan', 'pmfby', 'pmjjby', 'pmsby']);
      expect(r.summary.cashYearly).toBe(6000);
      const old = await run([s, '65', 'no income'], lang);
      expect(ids(old.summary.eligible)).toEqual(['haryana-oasa', 'kcc', 'pm-kisan', 'pmfby', 'pmsby']);
    }
  });

  it('mother, 72, Rohtak: Vay Vandana + Old Age Samman Allowance, nothing to ask', async () => {
    for (const s of [EXAMPLES.hi[1], 'मेरी माँ 72 साल की हैं, रोहतक, हरियाणा में रहती हैं, कोई आमदनी नहीं है', 'My mother is 72, lives in Rohtak, Haryana, no income']) {
      const r = await run([s], lang);
      expect(r.conv.suggest).toBeNull();
      expect(ids(r.summary.eligible)).toEqual(['haryana-oasa', 'vay-vandana']);
      expect(r.summary.cashYearly).toBe(38400);
      expect(r.conv.profile.subject).toBe('mother');
    }
  });

  it('migrant construction worker: worker schemes + insurance, ration under check', async () => {
    for (const s of [EXAMPLES.hi[2], EXAMPLES.en[2], 'Main 28 saal ka hoon, Bihar se hoon, Delhi mein construction ka kaam karta hoon, 12000 mahine ka kamata hoon']) {
      const r = await run([s], lang);
      expect(r.conv.suggest).toBeNull();
      expect(ids(r.summary.eligible)).toEqual(['e-shram', 'pm-sym', 'pmjjby', 'pmsby']);
      expect(ids(r.summary.check)).toEqual(['onorc']);
      expect(r.conv.profile).toMatchObject({ age: 28, state: 'delhi', homeState: 'bihar', migrant: true, incomeMonthly: 12000 });
    }
  });

  it('first-time mother: Matru Vandana ₹5,000 straight away', async () => {
    for (const s of [EXAMPLES.hi[3], EXAMPLES.en[3], 'Main pehli baar maa banne wali hoon']) {
      const first = await run([s], lang);
      expect(first.conv.profile).toMatchObject({ pregnant: true, childOrder: 1, gender: 'female' });
      expect(ids(first.summary.eligible)).toContain('pmmvy');
      expect(first.summary.oneTime).toBe(5000);
    }
  });

  it('new father of a girl: girl-child schemes first, no questions needed', async () => {
    for (const s of [
      'I have recently become a father of a girl child and I want to know the schemes related to that',
      'मैं हाल ही में एक बेटी का पिता बना हूँ, बेटी के लिए कौन सी योजनाएँ हैं?',
      'Abhi meri beti hui hai, uske liye koi yojana batao',
    ]) {
      const r = await run([s], lang);
      expect(ids(r.summary.eligible)).toEqual(['ssy']);
      expect(ids(r.summary.check)).toEqual(['pmmvy']);
      expect(r.conv.suggest).toBe('childOrder');
      expect(r.message.text.toLowerCase()).toMatch(/congratulations|बधाई/);
      const second = await run([s, lang === 'hi' ? 'दूसरा बच्चा' : 'second'], lang);
      expect(ids(second.summary.eligible)).toEqual(['pmmvy', 'ssy']);
      expect(second.summary.oneTime).toBe(6000);
    }
  });

  it('asking about a topic shows those schemes even with nothing else known', async () => {
    const r = await run([lang === 'hi' ? 'बीमा की कौन सी योजनाएँ हैं?' : 'What insurance schemes are there?'], lang);
    expect(ids([...r.summary.eligible, ...r.summary.check])).toEqual(expect.arrayContaining(['pmsby', 'pmjjby', 'vay-vandana']));
    const p = await run(['pension yojana batao'], lang);
    expect(ids(p.summary.check)).toEqual(expect.arrayContaining(['haryana-oasa', 'pm-sym']));
  });

  it('keeps the conversation going: a follow-up adds to what was said', async () => {
    const r = await run([EXAMPLES.en[0], 'I am 30', 'mere paas ration card hai'], lang);
    expect(r.conv.profile).toMatchObject({ occupation: 'farmer', age: 30, hasRationCard: true });
  });
});

describe('parser details', () => {
  it('reads Hindi number words, lakh and yearly income', () => {
    expect(parseUtterance('मेरी उम्र बहत्तर साल है').age).toBe(72);
    expect(parseUtterance('saal ka dhai lakh kamate hain').incomeMonthly).toBe(20833);
    expect(parseUtterance('मेरे पास 3 किल्ले जमीन है').landAcres).toBe(3);
  });
  it('handles negation and exclusions', () => {
    expect(parseUtterance('mere paas ration card nahi hai').hasRationCard).toBe(false);
    expect(parseUtterance('I pay income tax').taxPayer).toBe(true);
    expect(parseUtterance('main taxi driver hoon').taxPayer).toBeUndefined();
    expect(parseUtterance('मेरे पास ज़मीन नहीं है').hasLand).toBe(false);
  });
  it('does not mistake "becoming a mother" for "my mother"', () => {
    expect(parseUtterance('मैं माँ बनने वाली हूँ').subject).toBeUndefined();
  });
});

describe('questions about schemes', () => {
  const ask = async (text, lang = 'hi') => (await handleUtterance(initialConv(), text, lang)).message;
  it('answers amount, documents, apply and eligibility from seed data', async () => {
    let m = await ask('पीएम किसान में कितना पैसा मिलता है?');
    expect(m.scheme).toBe('pm-kisan');
    expect(m.text).toContain('₹6,000');
    m = await ask('What documents for e-Shram card?', 'en');
    expect(m.scheme).toBe('e-shram');
    expect(m.text).toContain('Aadhaar');
    m = await ask('Ayushman vay vandana card kaise banega', 'en');
    expect(m.scheme).toBe('vay-vandana');
    expect(m.text).toContain('beneficiary.nha.gov.in');
    m = await ask('जीवन ज्योति बीमा किसको मिलता है?');
    expect(m.scheme).toBe('pmjjby');
    expect(m.text).toContain('18');
  });
  it('is honest about status checks and out-of-scope questions', async () => {
    let m = await ask('PM kisan ki kist nahi aayi', 'en');
    expect(m.text).toMatch(/cannot see/);
    m = await ask('आप क्या कर सकते हैं?');
    expect(m.browse).toBe(true);
    m = await ask('aaj mausam kaisa hai', 'en');
    expect(m.text).toMatch(/did not understand/);
  });
  it('still treats descriptions as descriptions', async () => {
    const r = await handleUtterance(initialConv(), 'मैं किसान हूँ, 45 साल का, हरियाणा से', 'hi');
    expect(r.message.scheme).toBeUndefined();
    expect(r.conv.profile.occupation).toBe('farmer');
  });
});

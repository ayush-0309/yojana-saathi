import { describe, it, expect } from 'vitest';
import { handleUtterance, initialConv } from './conversation.js';
import { parseUtterance } from './parser.js';
import { EXAMPLES } from './i18n.js';

const ids = (list) => list.map((r) => r.scheme.id).sort();

async function run(lines, lang) {
  let conv = initialConv();
  let last;
  const asked = [];
  for (const [i, line] of lines.entries()) {
    last = await handleUtterance(conv, line, lang, { fresh: i === 0 });
    conv = last.conv;
    if (conv.awaiting) asked.push(conv.awaiting);
  }
  return { ...last, asked };
}

describe.each(['hi', 'en'])('scenarios in %s', (lang) => {
  it('farmer in Haryana: asks age, then farm schemes + age-appropriate insurance', async () => {
    for (const s of [EXAMPLES.hi[0], EXAMPLES.en[0], 'Main Haryana ka kisan hoon, mere paas do ekad zameen hai']) {
      const first = await run([s], lang);
      expect(first.conv.awaiting).toBe('age');
      expect(first.message.text.length).toBeGreaterThan(5);
      const r = await run([s, lang === 'hi' ? 'पैंतालीस साल' : '45'], lang);
      expect(r.conv.phase).toBe('results');
      expect(ids(r.summary.eligible)).toEqual(['kcc', 'pm-kisan', 'pmfby', 'pmjjby', 'pmsby']);
      expect(r.summary.cashYearly).toBe(6000);
      const old = await run([s, '65', 'no income'], lang);
      expect(ids(old.summary.eligible)).toEqual(['haryana-oasa', 'kcc', 'pm-kisan', 'pmfby', 'pmsby']);
    }
  });

  it('mother, 72, Rohtak: Vay Vandana + Old Age Samman Allowance, no follow-up', async () => {
    for (const s of [EXAMPLES.hi[1], 'मेरी माँ 72 साल की हैं, रोहतक, हरियाणा में रहती हैं, कोई आमदनी नहीं है', 'My mother is 72, lives in Rohtak, Haryana, no income']) {
      const r = await run([s], lang);
      expect(r.asked).toEqual([]);
      expect(ids(r.summary.eligible)).toEqual(['haryana-oasa', 'vay-vandana']);
      expect(r.summary.cashYearly).toBe(38400);
      expect(r.summary.insurance).toBe(1);
      expect(r.conv.profile.subject).toBe('mother');
    }
  });

  it('migrant construction worker: worker schemes + insurance, ration under check', async () => {
    for (const s of [EXAMPLES.hi[2], EXAMPLES.en[2], 'Main 28 saal ka hoon, Bihar se hoon, Delhi mein construction ka kaam karta hoon, 12000 mahine ka kamata hoon']) {
      const r = await run([s], lang);
      expect(r.asked).toEqual([]);
      expect(ids(r.summary.eligible)).toEqual(['e-shram', 'pm-sym', 'pmjjby', 'pmsby']);
      expect(ids(r.summary.check)).toEqual(['onorc']);
      expect(r.conv.profile).toMatchObject({ age: 28, state: 'delhi', homeState: 'bihar', migrant: true, incomeMonthly: 12000 });
    }
  });

  it('first-time mother: Matru Vandana ₹5,000', async () => {
    for (const s of [EXAMPLES.hi[3], EXAMPLES.en[3], 'Main pehli baar maa banne wali hoon']) {
      const first = await run([s], lang);
      expect(first.conv.profile).toMatchObject({ pregnant: true, childOrder: 1, gender: 'female' });
      const r = await run([s, '24'], lang);
      expect(ids(r.summary.eligible)).toContain('pmmvy');
      expect(r.summary.oneTime).toBe(5000);
      const skipped = await run([s, 'पता नहीं'], lang);
      expect(ids(skipped.summary.eligible)).toEqual(['pmmvy']);
      expect(ids(skipped.summary.check)).toEqual(['pmjjby', 'pmsby']);
    }
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

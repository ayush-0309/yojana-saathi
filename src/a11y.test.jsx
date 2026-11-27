// @vitest-environment jsdom
// Automated accessibility checks (axe-core, WCAG 2.1 A/AA) on each main screen.
// Colour contrast cannot be measured in jsdom; the palette is checked in tailwind.config.js comments.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
});
afterEach(cleanup);

async function violations() {
  const r = await axe.run(document.body, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
}

it('the audit itself catches problems (self-check)', async () => {
  render(<main><img src="x.png" /><button type="button" /></main>);
  const found = (await violations()).join(' ');
  expect(found).toMatch(/image-alt/);
  expect(found).toMatch(/button-name/);
});

describe.each(['hi', 'en'])('accessibility (%s)', (lang) => {
  beforeEach(() => localStorage.setItem('yf.lang', JSON.stringify(lang)));

  it('home screen', async () => {
    render(<App />);
    expect(await violations()).toEqual([]);
  });

  it('chat with results and an optional question', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I have recently become a father of a girl child' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form'));
    await screen.findAllByText(lang === 'hi' ? 'बेटी के लिए बचत खाता' : 'Savings account for your daughter');
    expect(await violations()).toEqual([]);
  });

  it('scheme detail, all schemes and my schemes', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: lang === 'hi' ? /सभी योजनाएँ देखें/ : /see all schemes/i }));
    expect(await violations()).toEqual([]);
    fireEvent.click(await screen.findByText(lang === 'hi' ? 'किसान परिवारों को साल के ₹6,000' : '₹6,000 a year for farmer families'));
    expect(await violations()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: lang === 'hi' ? /मैंने आवेदन कर दिया/ : /i have applied/i }));
    await screen.findAllByRole('listitem');
    expect(await violations()).toEqual([]);
  });

  it('call mode', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: lang === 'hi' ? /कॉल मोड/ : /call mode/i }));
    expect(await violations()).toEqual([]);
  });
});

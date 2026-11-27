// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('yf.lang', JSON.stringify('en'));
  Element.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
});
afterEach(cleanup);

const say = (text) => {
  // no microphone in the test browser, so the text box is already open
  const open = screen.queryByRole('button', { name: /type instead/i });
  if (open) fireEvent.click(open);
  fireEvent.change(screen.getByPlaceholderText(/type what you want to say/i), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
};

describe('Yojana साथी app', () => {
  it('shows the home screen with tiles, examples and the trust footer', () => {
    render(<App />);
    expect(screen.getByText('Who are we finding schemes for?')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Farmer I grow crops$/ })).toBeTruthy();
    expect(screen.getByText(/Independent helper\. Confirm on the official portal before applying\./)).toBeTruthy();
  });

  it('answers a new father straight away with girl-child schemes', async () => {
    render(<App />);
    say('I have recently become a father of a girl child');
    expect(await screen.findByText(/Congratulations on your daughter!/)).toBeTruthy();
    expect(screen.getByText('Savings account for your daughter')).toBeTruthy();
    expect(screen.getByText('Money for pregnant women and new mothers')).toBeTruthy();
    // optional follow-up, one tap
    fireEvent.click(screen.getByRole('button', { name: 'Second child' }));
    expect((await screen.findAllByText('₹6,000 if the second child is a girl')).length).toBeGreaterThan(0);
  });

  it('runs a demo scenario from an example chip and opens a scheme', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/I am 28, a construction worker/));
    expect(await screen.findByText('Free worker ID card (e-Shram)')).toBeTruthy();
    fireEvent.click(screen.getByText('Free worker ID card (e-Shram)'));
    expect(await screen.findByText('Documents to keep ready', { exact: false })).toBeTruthy();
    expect(screen.getByRole('link', { name: /eshram\.gov\.in/ }).getAttribute('href')).toBe('https://eshram.gov.in');
    expect(screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=/);
  });

  it('saves a scheme, tracks it and can delete all saved data', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /see all schemes/i }));
    fireEvent.click(await screen.findByText('Savings account for your daughter'));
    fireEvent.click(screen.getByRole('button', { name: /i have applied/i }));
    const card = (await screen.findByText('Sukanya Samriddhi Yojana (SSY)')).closest('li');
    expect(within(card).getByText('Applied')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('yf.apps')).ssy.status).toBe('applied');
    fireEvent.click(screen.getByRole('button', { name: /delete everything/i }));
    fireEvent.click(screen.getByRole('button', { name: /tap again to delete/i }));
    expect(await screen.findByText(/Nothing saved yet/)).toBeTruthy();
  });

  it('answers a direct question about a scheme', async () => {
    render(<App />);
    say('How much does PM-KISAN give?');
    expect(await screen.findByText(/₹6,000 a year, in 3 instalments/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /see full details/i })).toBeTruthy();
  });
});

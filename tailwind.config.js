/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#23306B',      // indigo primary
        'brand-soft': '#E6E9F5',
        turmeric: '#E8A317',   // mic + highlights (ink icons on it)
        paper: '#F6F7FB',      // background
        ink: '#1B1E2B',        // text
        muted: '#4A5068',      // secondary text (7:1 on paper)
        line: '#D9DCE8',
        ok: '#1F8A5B',         // eligible: borders, icons, fills
        'ok-text': '#17704A',  // eligible text (AA on white)
        'ok-bg': '#E8F4EE',
        check: '#B86E00',      // check-one-thing: borders, icons
        'check-text': '#8A5200', // AA on white
        'check-bg': '#FFF4E0',
      },
      fontFamily: { sans: ['Mukta', 'system-ui', 'sans-serif'] },
      fontSize: { body: ['18px', '1.5'], small: ['16px', '1.45'] },
      minHeight: { tap: '56px' },
      minWidth: { tap: '56px' },
    },
  },
  plugins: [],
};

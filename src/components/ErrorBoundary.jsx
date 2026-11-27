import React from 'react';

/** If anything breaks, show a calm bilingual screen with a way back instead of a blank page. */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // No analytics or remote logging: keep the error on this device only.
    console.error('Yojana साथी error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-[24px] font-bold text-brand">कुछ गड़बड़ हो गई · Something went wrong</h1>
        <p>माफ़ कीजिए। फिर से शुरू करने के लिए नीचे दबाएँ। आपकी सेव की हुई योजनाएँ सुरक्षित हैं।</p>
        <p className="text-muted">Sorry. Tap below to start again. Your saved schemes are safe.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-tap rounded-2xl bg-brand px-6 text-[19px] font-semibold text-white"
        >
          फिर से शुरू करें · Start again
        </button>
      </main>
    );
  }
}

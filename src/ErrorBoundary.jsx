import { Component } from 'react';

// Catches render-time exceptions anywhere below it so a single broken component
// degrades to a readable message instead of a blank white screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface in dev tools; a real deployment would forward this to Sentry/Logflare.
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf8f2',
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: '#16181d',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c0392b',
            margin: '0 0 0.75rem',
          }}
        >
          Stop Press
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            margin: '0 0 0.75rem',
          }}
        >
          Something went wrong
        </h1>
        <p style={{ color: '#5a5a5a', maxWidth: '46ch', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          An unexpected error interrupted this page. Reloading usually clears it.
        </p>
        <button
          onClick={() => window.location.assign('/home')}
          style={{
            background: '#0a1e3d',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            padding: '0.7rem 1.4rem',
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Back to front page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;

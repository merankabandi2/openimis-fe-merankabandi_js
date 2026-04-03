import React from 'react';

/**
 * Error boundary that catches React render errors (e.g. when FatalErrorPage
 * crashes because it renders outside IntlProvider context) and shows a
 * plain-HTML fallback instead of a blank white screen.
 */
class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[SafeErrorBoundary] Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
        >
          <h2 style={{ color: '#d32f2f' }}>
            Une erreur est survenue / An error occurred
          </h2>
          <p style={{ color: '#555', maxWidth: 600, margin: '16px auto' }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Recharger la page / Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SafeErrorBoundary;

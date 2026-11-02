import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React application:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              ГОСТ МЕТАЛЛ
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
              Произошла ошибка при загрузке
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
              Приложение восстанавливается. Вы можете перезагрузить страницу или сбросить сохраненные параметры.
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: '#0f172a',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f87171',
                overflowX: 'auto',
                marginBottom: '20px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Перезагрузить
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Сброс кэша
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA service worker safely after initial render
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      registerSW({
        immediate: true,
        onRegisterError(error) {
          console.warn('PWA service worker registration error:', error);
        }
      });
    } catch (err) {
      console.warn('Service worker setup caught error:', err);
    }
  });
}
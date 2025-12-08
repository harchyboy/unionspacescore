import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

async function enableMocking() {
  // Only enable MSW in development (not in production builds)
  if (import.meta.env.PROD) {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  } catch (error) {
    console.error('Failed to start MSW:', error);
    // Continue even if MSW fails
    return Promise.resolve();
  }
}

enableMocking().finally(() => {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
});

// Safety polyfill for modern JS runtime features like global Iterator in browser/iframe
if (typeof window !== 'undefined' && !(window as any).Iterator) {
  try {
    (window as any).Iterator = class Iterator {};
  } catch (e) {
    // Ignore polyfill error
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


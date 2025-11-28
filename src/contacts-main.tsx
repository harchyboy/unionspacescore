import React from 'react';
import ReactDOM from 'react-dom/client';
import ContactsPage from './pages/ContactsPage';
import './index.css'; // We'll create this for Tailwind imports if needed, or rely on CDN

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContactsPage />
  </React.StrictMode>,
);


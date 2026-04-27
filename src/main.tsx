import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initKeycloak } from './services/keycloak';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Initialisation globale de Keycloak avant le rendu de l'App
initKeycloak(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

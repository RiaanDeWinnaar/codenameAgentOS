import React from 'react';
import { createRoot } from 'react-dom/client';
// Restored to canonical main App (debug harness removed)
import App from './App';
import './App.css';

// Get the root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root and render the app
const root = createRoot(container);

// Log when React is starting
console.log('Initializing React application (full App)...');
if (window.electronAPI) {
  window.electronAPI.logInfo('React application initializing');
}

// Render the main application component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log when React has rendered
console.log('React application (full App) rendered successfully');
if (window.electronAPI) {
  window.electronAPI.logInfo('React application rendered successfully');
}

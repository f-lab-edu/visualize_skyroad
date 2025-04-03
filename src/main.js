import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
const rootElement = document.getElementById('root');
if (rootElement !== null) {
    createRoot(rootElement).render(
    // <React.StrictMode>
    React.createElement(App, null)
    // </React.StrictMode>
    );
}
else {
    console.error('Root element not found');
}

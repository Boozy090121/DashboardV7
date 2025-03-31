import React from 'react';
import ReactDOM from 'react-dom/client';
import './index-css.css';
import AppWithContext from './AppWithContext';

// Initialize the application with React 18 syntax
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithContext />
  </React.StrictMode>
); 
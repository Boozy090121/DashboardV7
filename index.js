import React from 'react';
import ReactDOM from 'react-dom/client';
import './index-css.css';
import { DataProvider } from './data-context-provider';
import NovoNordiskDashboard from './novo-nordisk-dashboard';

// Initialize the application with React 18 syntax
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  </React.StrictMode>
); 
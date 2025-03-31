import React from 'react';
import { DataProvider } from './data-context-provider';
import NovoNordiskDashboard from './novo-nordisk-dashboard';

// Simple wrapper component to ensure proper context wrapping
const App = () => {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  );
};

export default App; 
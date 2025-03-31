import React from 'react';
import NovoNordiskDashboard from './novo-nordisk-dashboard';
import AppWithContext from './AppWithContext';

// Simple wrapper component to ensure proper context wrapping
const App = () => {
  return <AppWithContext />;
};

export default App; 
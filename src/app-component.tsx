import React from 'react';
import NovoNordiskDashboard from './novo-nordisk-dashboard';
import { DataProvider } from './data-context-provider';

const App: React.FC = () => {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  );
};

export default App;

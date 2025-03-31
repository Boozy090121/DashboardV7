import React from 'react';
import { DataProvider } from './data-context-provider';
import NovoNordiskDashboard from './novo-nordisk-dashboard';

// This is a simple wrapper that makes sure the dashboard is properly wrapped with DataProvider
const ContextWrapper = () => {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  );
};

export default ContextWrapper; 
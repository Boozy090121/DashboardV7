import React, { createContext, useContext } from 'react';

// Create a context with default values
const DataContext = createContext({
  isLoading: true,
  error: null,
  data: null,
  lastUpdated: null,
  fileStatus: {},
  refreshData: () => {}
});

// Custom hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

// Export the provider component as well
export const DataProvider = DataContext.Provider;
export default DataContext; 
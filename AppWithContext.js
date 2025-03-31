import React, { createContext, useState, useContext, useEffect } from 'react';
import NovoNordiskDashboard from './novo-nordisk-dashboard.js';

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
export const useDataContext = () => useContext(DataContext);

// All-in-one component that combines everything
const AppWithContext = () => {
  // State for the data
  const [dataState, setDataState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null,
    fileStatus: {
      "complete-data.json": { loaded: false, status: 'pending' }
    }
  });

  // Load data function
  const loadData = async () => {
    try {
      console.log("Starting to load JSON data...");
      
      setDataState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        fileStatus: {
          ...prev.fileStatus,
          "complete-data.json": { loaded: false, status: 'loading' }
        }
      }));

      // Fetch data
      try {
        const response = await fetch(`${window.location.origin}/data/complete-data.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log("Successfully loaded complete data");
        
        // Update state with the loaded data
        setDataState({
          isLoading: false,
          error: null,
          data: jsonData,
          lastUpdated: new Date(),
          fileStatus: {
            "complete-data.json": { loaded: true, status: 'success' }
          }
        });
      } catch (error) {
        console.error("Error loading data:", error);
        
        // Set the error state without generating mock data
        setDataState({
          isLoading: false,
          error: `Error loading data: ${error.message}`,
          data: null,
          lastUpdated: new Date(),
          fileStatus: {
            "complete-data.json": { loaded: false, status: 'error', error: error.message }
          }
        });
      }
    } catch (error) {
      console.error("Top-level error:", error);
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load data: ${error.message}`
      }));
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Create the context value
  const contextValue = {
    isLoading: dataState.isLoading,
    error: dataState.error,
    data: dataState.data,
    fileStatus: dataState.fileStatus,
    lastUpdated: dataState.lastUpdated,
    refreshData: loadData
  };

  // Render the provider and dashboard
  return (
    <DataContext.Provider value={contextValue}>
      <NovoNordiskDashboard />
    </DataContext.Provider>
  );
};

export default AppWithContext; 
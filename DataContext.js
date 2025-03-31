import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const DataContext = createContext(undefined);

// Custom hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

// Provider component with data fetching logic
export const DataProvider = ({ children }) => {
  // State for the data
  const [state, setState] = useState({
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
      
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        fileStatus: {
          ...prev.fileStatus,
          "complete-data.json": { loaded: false, status: 'loading' }
        }
      }));

      // Fetch data with a retry mechanism
      const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText} (${response.status})`);
          }
          return await response.json();
        } catch (error) {
          if (retries > 0) {
            console.log(`Retrying fetch... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay * 1.5);
          }
          throw error;
        }
      };
      
      try {
        // First try the preferred location
        const jsonData = await fetchWithRetry(`${window.location.origin}/data/complete-data.json`);
        console.log("Successfully loaded complete data");
        
        // Update state with the loaded data
        setState({
          isLoading: false,
          error: null,
          data: jsonData,
          lastUpdated: new Date(),
          fileStatus: {
            "complete-data.json": { loaded: true, status: 'success' }
          }
        });
      } catch (error) {
        console.error("Error loading data from primary source:", error);
        
        // Try fallback location
        try {
          console.log("Attempting to load from fallback location...");
          const jsonData = await fetchWithRetry(`${window.location.origin}/complete-data.json`);
          console.log("Successfully loaded data from fallback location");
          
          setState({
            isLoading: false,
            error: null,
            data: jsonData,
            lastUpdated: new Date(),
            fileStatus: {
              "complete-data.json": { loaded: true, status: 'success' }
            }
          });
        } catch (fallbackError) {
          console.error("Error loading data from fallback location:", fallbackError);
          
          // Set error state without using mock data
          setState({
            isLoading: false,
            error: `Error loading data: ${error.message}. Fallback also failed: ${fallbackError.message}`,
            data: null,
            lastUpdated: new Date(),
            fileStatus: {
              "complete-data.json": { loaded: false, status: 'error', error: error.message }
            }
          });
        }
      }
    } catch (error) {
      console.error("Top-level error:", error);
      setState(prev => ({
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
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    fileStatus: state.fileStatus,
    lastUpdated: state.lastUpdated,
    refreshData: loadData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 
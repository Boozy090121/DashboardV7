import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as XLSX from 'xlsx';

// Extend Window interface to include fs property
declare global {
  interface Window {
    fs: {
      readFile: (filename: string) => Promise<any>;
    }
  }
}

// Implement a mock fs if it doesn't exist
if (typeof window !== 'undefined' && !window.fs) {
  window.fs = {
    readFile: async (filename: string) => {
      console.log(`Mock file read for: ${filename}`);
      // In a real implementation, this would return file data
      // For now, just return an empty buffer that the processor can handle
      return new ArrayBuffer(0);
    }
  };
}

// Type definitions
interface FileStatus {
  loaded: boolean;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

interface FileStatusMap {
  [filename: string]: FileStatus;
}

interface DataState {
  isLoading: boolean;
  error: string | null;
  data: any | null;
  lastUpdated: Date | null;
  fileStatus: FileStatusMap;
}

interface DataContextValue {
  isLoading: boolean;
  error: string | null;
  data: any | null;
  fileStatus: FileStatusMap;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

interface DataProviderProps {
  children: ReactNode;
}

// Create context
const DataContext = createContext<DataContextValue | undefined>(undefined);

// Excel processor
import NovoNordiskExcelProcessor from './ExcelProcessor';
import DataTransformer from './DataTransformer';

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // The shared state that will be available to our components
  const [dataState, setDataState] = useState<DataState>({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null,
    fileStatus: {
      "complete-data.json": { loaded: false, status: 'pending' },
      "internal.json": { loaded: false, status: 'pending' },
      "external.json": { loaded: false, status: 'pending' },
      "process.json": { loaded: false, status: 'pending' }
    }
  });

  // Initialize the processor
  const [processor] = useState<any>(new NovoNordiskExcelProcessor());

  // Function to load the preprocessed JSON data files
  const loadData = async (): Promise<void> => {
    try {
      console.log("Starting to load JSON data...");
      
      setDataState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Try to load the complete data file first - this is the fastest approach
      try {
        // Update status to loading
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            ...prev.fileStatus,
            "complete-data.json": { loaded: false, status: 'loading' }
          }
        }));

        const response = await fetch('/data/complete-data.json');
        if (!response.ok) {
          throw new Error(`Failed to load complete data file: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log("Successfully loaded complete data");
        
        // Use DataTransformer to transform raw records if records array is present
        let processedData = jsonData;
        
        if (jsonData.records && Array.isArray(jsonData.records)) {
          console.log(`Transforming ${jsonData.records.length} records using DataTransformer`);
          const transformer = new DataTransformer();
          transformer.setRawData(jsonData.records);
          processedData = transformer.transformData();
        }
        
        // Update the state with the loaded data
        setDataState(prev => ({
          ...prev,
          isLoading: false,
          data: processedData,
          lastUpdated: new Date(),
          fileStatus: {
            ...prev.fileStatus,
            "complete-data.json": { loaded: true, status: 'success' }
          }
        }));
        
        return; // Exit early since we loaded the complete data
        
      } catch (err: any) {
        console.error("Error loading complete data:", err);
        console.log("Falling back to loading individual files...");
        
        // Update status to error for complete data
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            ...prev.fileStatus,
            "complete-data.json": { loaded: false, status: 'error', error: err.message }
          }
        }));
        
        // Fall back to loading individual files
      }

      // Load individual files
      const files = [
        { name: "internal.json", type: "internal" },
        { name: "external.json", type: "external" },
        { name: "process.json", type: "process" }
      ];

      const fileData: Record<string, any> = {};
      let combinedRecords: any[] = [];

      // Process each file in sequence
      for (const file of files) {
        try {
          // Update status to loading
          setDataState(prev => ({
            ...prev,
            fileStatus: {
              ...prev.fileStatus,
              [file.name]: { loaded: false, status: 'loading' }
            }
          }));

          // Fetch the JSON file
          const response = await fetch(`/data/${file.name}`);
          if (!response.ok) {
            throw new Error(`Failed to load ${file.name}: ${response.statusText}`);
          }
          
          const jsonData = await response.json();
          fileData[file.type] = jsonData;
          
          // If the file contains records, add them to our combined records array
          if (jsonData.records && Array.isArray(jsonData.records)) {
            // Add a source field to each record to track its origin
            const sourceRecords = jsonData.records.map((record: any) => ({
              ...record,
              source: file.type
            }));
            
            combinedRecords = [...combinedRecords, ...sourceRecords];
          }
          
          console.log(`Successfully loaded ${file.name}`);

          // Update status to success
          setDataState(prev => ({
            ...prev,
            fileStatus: {
              ...prev.fileStatus,
              [file.name]: { loaded: true, status: 'success' }
            }
          }));
        } catch (err: any) {
          console.error(`Error loading ${file.name}:`, err);
          
          // Update status to error
          setDataState(prev => ({
            ...prev,
            fileStatus: {
              ...prev.fileStatus,
              [file.name]: { loaded: false, status: 'error', error: err.message }
            }
          }));
        }
      }

      // If we have collected records from individual files, process them with DataTransformer
      if (combinedRecords.length > 0) {
        console.log(`Transforming ${combinedRecords.length} combined records using DataTransformer`);
        const transformer = new DataTransformer();
        transformer.setRawData(combinedRecords);
        const transformedData = transformer.transformData();
        
        // Update the state with transformed data
        setDataState(prev => ({
          ...prev,
          isLoading: false,
          data: transformedData,
          lastUpdated: new Date(),
        }));
        
        return;
      }
      
      // If we couldn't load the complete data but have some of the individual files,
      // try to use the Excel processor as a fallback
      if (Object.keys(fileData).length > 0) {
        console.log("Using Excel processor to process data");
        
        // For each data type we've loaded, pass it to the Excel processor
        Object.entries(fileData).forEach(([type, data]) => {
          processor.setProcessedData(data);
        });
        
        const processedData = processor.getProcessedData();
        
        // Update the state with processed data
        setDataState(prev => ({
          ...prev,
          isLoading: false,
          data: processedData,
          lastUpdated: new Date(),
        }));
        
        return;
      }
      
      // If we get here, we couldn't load any data, so use mock data
      console.log("Falling back to mock data");
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        data: getMockData(),
        lastUpdated: new Date(),
      }));
    } catch (error: any) {
      console.error("Error loading files:", error);
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "An error occurred while loading the data",
        data: getMockData() // Still provide mock data on error
      }));
    }
  };

  // Generate mock data if needed
  const getMockData = (): any => {
    // Return the same mock data structure as in the preprocess-excel.js script
    return {
      overview: {
        totalRecords: 1245,
        totalLots: 78,
        overallRFTRate: 92.3,
        analysisStatus: 'Complete',
        rftPerformance: [
          { name: 'Pass', value: 1149, percentage: 92.3 },
          { name: 'Fail', value: 96, percentage: 7.7 }
        ],
        issueDistribution: [
          { name: 'Documentation Error', value: 42 },
          { name: 'Process Deviation', value: 28 },
          { name: 'Equipment Issue', value: 15 },
          { name: 'Material Issue', value: 11 }
        ],
        lotQuality: {
          pass: 72,
          fail: 6,
          percentage: 92.3,
          change: 1.5
        },
        processTimeline: [
          { month: 'Jan', recordRFT: 90.2, lotRFT: 91.5 },
          { month: 'Feb', recordRFT: 91.4, lotRFT: 92.0 },
          { month: 'Mar', recordRFT: 92.8, lotRFT: 93.1 },
          { month: 'Apr', recordRFT: 91.5, lotRFT: 92.3 },
          { month: 'May', recordRFT: 92.3, lotRFT: 93.5 },
          { month: 'Jun', recordRFT: 93.1, lotRFT: 94.0 }
        ]
      },
      internalRFT: {
        departmentPerformance: [
          { department: 'Production', pass: 328, fail: 22, rftRate: 93.7 },
          { department: 'Quality', pass: 248, fail: 12, rftRate: 95.4 },
          { department: 'Packaging', pass: 187, fail: 18, rftRate: 91.2 },
          { department: 'Logistics', pass: 156, fail: 24, rftRate: 86.7 }
        ],
        formErrors: [
          { name: 'Production Record', errors: 24, percentage: 18.2, trend: 'up' },
          { name: 'Batch Release', errors: 18, percentage: 13.6, trend: 'down' },
          { name: 'QC Checklist', errors: 15, percentage: 11.4, trend: 'flat' },
          { name: 'Material Transfer', errors: 12, percentage: 9.1, trend: 'down' },
          { name: 'Process Deviation', errors: 10, percentage: 7.6, trend: 'up' }
        ],
        errorTypePareto: [
          { type: 'Missing Signature', count: 32, cumulative: 32 },
          { type: 'Incorrect Information', count: 28, cumulative: 60 },
          { type: 'Incomplete Form', count: 18, cumulative: 78 },
          { type: 'Late Submission', count: 12, cumulative: 90 },
          { type: 'Illegible Entry', count: 6, cumulative: 96 }
        ]
      },
      externalRFT: {
        issueCategories: [
          { name: 'Documentation', value: 38 },
          { name: 'Quality', value: 27 },
          { name: 'Delivery', value: 18 },
          { name: 'Packaging', value: 12 },
          { name: 'Other', value: 5 }
        ],
        customerComments: [
          { category: 'Documentation', count: 38, sentiment: -0.2 },
          { category: 'Quality', count: 27, sentiment: -0.5 },
          { category: 'Delivery', count: 18, sentiment: -0.3 },
          { category: 'Packaging', count: 12, sentiment: -0.1 },
          { category: 'Other', count: 5, sentiment: 0 }
        ],
        correlationData: [
          { internalRFT: 92.3, externalRFT: 88.5, month: 'Jan' },
          { internalRFT: 93.1, externalRFT: 89.2, month: 'Feb' },
          { internalRFT: 91.8, externalRFT: 87.3, month: 'Mar' },
          { internalRFT: 94.2, externalRFT: 90.1, month: 'Apr' },
          { internalRFT: 95.1, externalRFT: 91.4, month: 'May' },
          { internalRFT: 94.8, externalRFT: 92.0, month: 'Jun' }
        ]
      },
      processMetrics: {
        reviewTimes: {
          NN: [2.8, 3.2, 3.5, 2.9, 3.1, 2.7],
          PCI: [3.4, 3.6, 3.2, 3.0, 2.9, 3.1]
        },
        cycleTimeBreakdown: [
          { step: 'Bulk Receipt', time: 1.2 },
          { step: 'Assembly', time: 3.5 },
          { step: 'PCI Review', time: 3.2 },
          { step: 'NN Review', time: 3.0 },
          { step: 'Packaging', time: 2.4 },
          { step: 'Final Review', time: 1.8 },
          { step: 'Release', time: 1.0 }
        ],
        waitingTimes: [
          { from: 'Bulk Receipt', to: 'Assembly', time: 0.5 },
          { from: 'Assembly', to: 'PCI Review', time: 1.2 },
          { from: 'PCI Review', to: 'NN Review', time: 0.8 },
          { from: 'NN Review', to: 'Packaging', time: 2.0 },
          { from: 'Packaging', to: 'Final Review', time: 0.7 },
          { from: 'Final Review', to: 'Release', time: 1.5 }
        ]
      },
      lotData: {
        B1001: { rftRate: 94.2, cycleTime: 16.5, hasErrors: false, releaseDate: '2025-02-15', department: 'Production' },
        B1002: { rftRate: 88.7, cycleTime: 18.2, hasErrors: true, releaseDate: '2025-02-20', department: 'Quality' },
        B1003: { rftRate: 96.3, cycleTime: 15.8, hasErrors: false, releaseDate: '2025-02-25', department: 'Production' },
        B1004: { rftRate: 90.1, cycleTime: 17.4, hasErrors: true, releaseDate: '2025-03-02', department: 'Packaging' },
        B1005: { rftRate: 93.8, cycleTime: 16.2, hasErrors: false, releaseDate: '2025-03-08', department: 'Production' }
      }
    };
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Value to be provided to consumers
  const contextValue: DataContextValue = {
    isLoading: dataState.isLoading,
    error: dataState.error,
    data: dataState.data,
    fileStatus: dataState.fileStatus,
    lastUpdated: dataState.lastUpdated,
    refreshData: loadData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextValue => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export default DataContext;

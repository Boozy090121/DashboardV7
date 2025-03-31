import * as XLSX from 'xlsx';
import DataTransformer from './DataTransformer';

class NovoNordiskExcelProcessor {
  constructor() {
    // Initialize with empty data structure
    this.processedData = null;
    this.dataTransformer = new DataTransformer();
    this.loadMockData(); // Load mock data by default
  }

  // Legacy method for processing Excel files - now primarily used for testing/development
  processExcelFile(fileData, fileType) {
    console.log(`Processing ${fileType} file`);
    
    try {
      if (fileData && fileData.byteLength > 0) {
        // If we have actual file data, process it
        const workbook = XLSX.read(fileData, { type: 'array' });
        
        if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
          console.log(`Loaded Excel workbook with ${workbook.SheetNames.length} sheets`);
          
          // In a real implementation, this is where you would extract and transform the data
          // For now, we'll just load mock data
        }
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
    }
    
    // Always ensure we have data to return
    if (!this.processedData) {
      this.loadMockData();
    }
    
    return true;
  }

  // Main method for accessing data
  getProcessedData() {
    // If we don't have processed data, load mock data
    if (!this.processedData) {
      this.loadMockData();
    }
    return this.processedData;
  }
  
  // Sets processed data from an external source (like our preprocessed JSON)
  setProcessedData(data) {
    // If data contains a records array, transform it using the DataTransformer
    if (data && Array.isArray(data.records)) {
      console.log(`Transforming ${data.records.length} records using DataTransformer`);
      this.dataTransformer.setRawData(data.records);
      this.processedData = this.dataTransformer.transformData();
    } else {
      // If data is already in the expected format, just use it directly
      this.processedData = data;
    }
  }
  
  // Load mock data as a fallback
  loadMockData() {
    this.processedData = {
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
  }
}

export default NovoNordiskExcelProcessor; 
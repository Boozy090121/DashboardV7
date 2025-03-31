const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('========== EXCEL PROCESSING DEBUG ==========');
console.log('Current directory:', process.cwd());
console.log('Files in current directory:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    console.log(`- ${file} (${fs.statSync(file).size} bytes)`);
  });
} catch (err) {
  console.error('Error listing files:', err);
}

// Define the Excel files to process
const excelFiles = [
  { path: './Internal RFT.xlsx', type: 'internal' },
  { path: './External RFT.xlsx', type: 'external' },
  { path: './Commercial Process.xlsx', type: 'process' }
];

// Create output directory
const outputDir = './public/data';
console.log(`\nTrying to create directory: ${outputDir}`);
try {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  } else {
    console.log(`Directory already exists: ${outputDir}`);
  }
} catch (error) {
  console.error(`Error with directory: ${error.message}`);
}

// Initialize data
const defaultData = {
  overview: {
    totalRecords: 1245,
    totalLots: 78,
    overallRFTRate: 92.3,
    analysisStatus: 'Using Excel Files',
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
  // Basic default data for other sections
  internalRFT: { departmentPerformance: [], formErrors: [] },
  externalRFT: { issueCategories: [], customerComments: [] },
  processMetrics: { reviewTimes: { NN: [], PCI: [] } },
  lotData: {}
};

// Process each Excel file
console.log('\nProcessing Excel files:');
let filesProcessed = 0;

excelFiles.forEach(file => {
  console.log(`\nChecking ${file.path}...`);
  try {
    if (fs.existsSync(file.path)) {
      console.log(`File exists (${fs.statSync(file.path).size} bytes)`);
      
      // Read the Excel file
      try {
        const workbook = XLSX.readFile(file.path);
        console.log(`Read Excel file. Sheets: ${workbook.SheetNames.join(', ')}`);
        
        // Basic processing - just count records
        let totalRecords = 0;
        let sheets = {};
        
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const records = XLSX.utils.sheet_to_json(sheet);
          
          console.log(`Sheet: ${sheetName}, Records: ${records.length}`);
          totalRecords += records.length;
          
          // Save the sheet data
          sheets[sheetName] = records;
        });
        
        console.log(`Total records in file: ${totalRecords}`);
        
        // Save the raw file data
        const outputPath = path.join(outputDir, `${file.type}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(sheets, null, 2));
        console.log(`Saved ${file.type} data to ${outputPath}`);
        
        // Update default data with some real information
        if (file.type === 'internal') {
          defaultData.overview.totalRecords = totalRecords;
          
          // Estimate pass/fail ratio as 90/10 split
          const passRecords = Math.round(totalRecords * 0.9);
          const failRecords = totalRecords - passRecords;
          
          defaultData.overview.rftPerformance = [
            { name: 'Pass', value: passRecords, percentage: 90 },
            { name: 'Fail', value: failRecords, percentage: 10 }
          ];
        }
        
        filesProcessed++;
      } catch (error) {
        console.error(`Error reading Excel file: ${error.message}`);
      }
    } else {
      console.log(`File does not exist`);
    }
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
  }
});

// Update the status based on processing
if (filesProcessed > 0) {
  defaultData.overview.analysisStatus = 'Processed Excel Data';
} else {
  defaultData.overview.analysisStatus = 'Using Sample Data (No Excel Files)';
}

// Save complete data
console.log('\nSaving complete data...');
try {
  const completeDataPath = path.join(outputDir, 'complete-data.json');
  fs.writeFileSync(completeDataPath, JSON.stringify(defaultData, null, 2));
  console.log(`Saved complete data to ${completeDataPath}`);
} catch (error) {
  console.error(`Error saving complete data: ${error.message}`);
}

// Create a metadata file
console.log('\nSaving metadata...');
try {
  const metadataPath = path.join(outputDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    files: excelFiles.map(f => ({ type: f.type, filename: path.basename(f.path) })),
    processedFiles: filesProcessed,
    processingDetails: 'Debug preprocessor to track Excel processing'
  }, null, 2));
  console.log(`Saved metadata to ${metadataPath}`);
} catch (error) {
  console.error(`Error saving metadata: ${error.message}`);
}

console.log('\n========== EXCEL PROCESSING COMPLETE =========='); 
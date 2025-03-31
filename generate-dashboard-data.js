const ExcelProcessor = require('./src/ExcelProcessor');
const fs = require('fs');
const path = require('path');

async function generateDashboardData() {
  console.log('Starting dashboard data generation...');
  
  try {
    // Create public/data directory if it doesn't exist
    const dataDir = path.resolve(process.cwd(), 'public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Created directory: ${dataDir}`);
    }
    
    // Initialize the Excel processor
    const processor = new ExcelProcessor({
      internalRftPath: path.resolve(process.cwd(), 'Internal RFT.xlsx'),
      externalRftPath: path.resolve(process.cwd(), 'External RFT.xlsx'),
      commercialProcessPath: path.resolve(process.cwd(), 'Commercial Process.xlsx'),
      outputPath: path.resolve(process.cwd(), 'public/data/complete-data.json')
    });
    
    // Process all Excel files and generate combined data
    await processor.processAll();
    
    // Create a second copy at the root for fallback
    fs.copyFileSync(
      path.resolve(process.cwd(), 'public/data/complete-data.json'),
      path.resolve(process.cwd(), 'public/complete-data.json')
    );
    
    console.log('Dashboard data generation completed successfully!');
    console.log('Files generated:');
    console.log('- public/data/complete-data.json');
    console.log('- public/complete-data.json (fallback copy)');
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    process.exit(1);
  }
}

// Run the function
generateDashboardData(); 
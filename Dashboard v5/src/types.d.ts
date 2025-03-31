declare module './ExcelProcessor' {
  export default class NovoNordiskExcelProcessor {
    constructor();
    processExcelFile(fileData: any, fileType: string): void;
    getProcessedData(): any;
  }
}

// Add any other module declarations as needed 
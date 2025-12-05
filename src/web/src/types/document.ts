export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: DocumentStatus;
  analysisResult?: AnalysisResult;
}

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisResult {
  documentType: string;
  confidence: number;
  extractedFields: ExtractedField[];
  rawText?: string;
  pages?: PageInfo[];
}

export interface ExtractedField {
  fieldName: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  text: string;
  tables?: TableInfo[];
}

export interface TableInfo {
  rowCount: number;
  columnCount: number;
  cells: TableCell[];
}

export interface TableCell {
  rowIndex: number;
  columnIndex: number;
  content: string;
  rowSpan?: number;
  columnSpan?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'failed';
}

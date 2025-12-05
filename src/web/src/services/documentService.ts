import axios, { AxiosProgressEvent } from 'axios';
import { Document, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await api.get<ApiResponse<Document[]>>('/documents');
      return response.data.data;
    } catch {
      // Return mock data for demo purposes
      return getMockDocuments();
    }
  },

  async getDocument(id: string): Promise<Document> {
    try {
      const response = await api.get<ApiResponse<Document>>(`/documents/${encodeURIComponent(id)}`);
      return response.data.data;
    } catch {
      // Return mock document for demo purposes
      const docs = getMockDocuments();
      const doc = docs.find(d => d.id === id);
      if (!doc) throw new Error('Document not found');
      return doc;
    }
  },

  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data.data;
    } catch {
      // Simulate upload for demo purposes
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          onProgress(i);
        }
      }
      return createMockDocument(file);
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`/documents/${encodeURIComponent(id)}`);
    } catch {
      // For demo purposes, just return success
      return;
    }
  },

  async analyzeDocument(id: string): Promise<Document> {
    const response = await api.post<ApiResponse<Document>>(`/documents/${encodeURIComponent(id)}/analyze`);
    return response.data.data;
  },
};

// Mock data for demonstration
function getMockDocuments(): Document[] {
  return [
    {
      id: '1',
      fileName: 'Invoice_2024_001.pdf',
      fileType: 'application/pdf',
      fileSize: 245678,
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      analysisResult: {
        documentType: 'Invoice',
        confidence: 0.95,
        extractedFields: [
          { fieldName: 'Invoice Number', value: 'INV-2024-001', confidence: 0.98 },
          { fieldName: 'Date', value: '2024-01-15', confidence: 0.97 },
          { fieldName: 'Total Amount', value: '$1,234.56', confidence: 0.96 },
          { fieldName: 'Vendor', value: 'Acme Corporation', confidence: 0.94 },
        ],
      },
    },
    {
      id: '2',
      fileName: 'Contract_Agreement.pdf',
      fileType: 'application/pdf',
      fileSize: 567890,
      uploadDate: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      analysisResult: {
        documentType: 'Contract',
        confidence: 0.92,
        extractedFields: [
          { fieldName: 'Contract Type', value: 'Service Agreement', confidence: 0.95 },
          { fieldName: 'Start Date', value: '2024-01-01', confidence: 0.93 },
          { fieldName: 'End Date', value: '2024-12-31', confidence: 0.93 },
          { fieldName: 'Party A', value: 'TechCorp Inc.', confidence: 0.91 },
          { fieldName: 'Party B', value: 'Solutions LLC', confidence: 0.90 },
        ],
      },
    },
    {
      id: '3',
      fileName: 'Receipt_Store_Purchase.jpg',
      fileType: 'image/jpeg',
      fileSize: 123456,
      uploadDate: new Date(Date.now() - 259200000).toISOString(),
      status: 'completed',
      analysisResult: {
        documentType: 'Receipt',
        confidence: 0.88,
        extractedFields: [
          { fieldName: 'Store Name', value: 'SuperMart', confidence: 0.92 },
          { fieldName: 'Date', value: '2024-01-10', confidence: 0.89 },
          { fieldName: 'Total', value: '$45.67', confidence: 0.91 },
        ],
      },
    },
    {
      id: '4',
      fileName: 'ID_Card_Scan.png',
      fileType: 'image/png',
      fileSize: 89012,
      uploadDate: new Date(Date.now() - 345600000).toISOString(),
      status: 'processing',
    },
    {
      id: '5',
      fileName: 'Medical_Report.pdf',
      fileType: 'application/pdf',
      fileSize: 345678,
      uploadDate: new Date(Date.now() - 432000000).toISOString(),
      status: 'pending',
    },
  ];
}

function createMockDocument(file: File): Document {
  return {
    id: Date.now().toString(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    uploadDate: new Date().toISOString(),
    status: 'processing',
  };
}

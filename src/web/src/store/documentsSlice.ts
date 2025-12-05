import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Document, UploadProgress } from '../types';
import { documentService } from '../services/documentService';

interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  uploadProgress: UploadProgress[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  uploadProgress: [],
  isLoading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async () => {
    const response = await documentService.getDocuments();
    return response;
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id: string) => {
    const response = await documentService.getDocument(id);
    return response;
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (file: File, { dispatch }) => {
    const progressCallback = (progress: number) => {
      dispatch(updateUploadProgress({
        fileName: file.name,
        progress,
        status: progress < 100 ? 'uploading' : 'analyzing',
      }));
    };
    
    const response = await documentService.uploadDocument(file, progressCallback);
    dispatch(updateUploadProgress({
      fileName: file.name,
      progress: 100,
      status: 'completed',
    }));
    return response;
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string) => {
    await documentService.deleteDocument(id);
    return id;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
    updateUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      const index = state.uploadProgress.findIndex(
        (p) => p.fileName === action.payload.fileName
      );
      if (index >= 0) {
        state.uploadProgress[index] = action.payload;
      } else {
        state.uploadProgress.push(action.payload);
      }
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      state.uploadProgress = state.uploadProgress.filter(
        (p) => p.fileName !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      // Fetch single document
      .addCase(fetchDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch document';
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to upload document';
      })
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      });
  },
});

export const {
  setCurrentDocument,
  updateUploadProgress,
  clearUploadProgress,
  clearError,
} = documentsSlice.actions;

export default documentsSlice.reducer;

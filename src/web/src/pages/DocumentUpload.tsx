import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Card,
} from '@fluentui/react-components';
import {
  ArrowUpload24Regular,
  DocumentAdd48Regular,
} from '@fluentui/react-icons';
import { toast } from 'react-toastify';
import DocumentDropzone from '../components/DocumentDropzone';
import UploadProgress from '../components/UploadProgress';
import { uploadDocument, updateUploadProgress } from '../store/documentsSlice';
import { RootState, AppDispatch } from '../store/store';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  selectedFiles: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  filesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'flex-end',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  tipsCard: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  tipsList: {
    marginTop: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
  },
  tipItem: {
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalXS,
  },
});

const DocumentUpload: React.FC = () => {
  const styles = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const { uploadProgress } = useSelector((state: RootState) => state.documents);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesDropped = useCallback((files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Please select files to upload');
      return;
    }

    for (const file of selectedFiles) {
      dispatch(updateUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      }));

      try {
        await dispatch(uploadDocument(file)).unwrap();
        toast.success(`${file.name} uploaded successfully`);
      } catch {
        dispatch(updateUploadProgress({
          fileName: file.name,
          progress: 0,
          status: 'failed',
        }));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setSelectedFiles([]);
  };

  const handleClear = () => {
    setSelectedFiles([]);
  };

  const activeUploads = uploadProgress.filter(
    u => u.status === 'uploading' || u.status === 'analyzing'
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <DocumentAdd48Regular />
          <Text size={800} weight="bold">
            Upload Documents
          </Text>
        </div>
        <Text size={400} className={styles.subtitle}>
          Upload documents for AI-powered analysis and data extraction
        </Text>
      </div>

      {/* Upload Section */}
      <div className={styles.uploadSection}>
        <DocumentDropzone
          onFilesDropped={handleFilesDropped}
          acceptedFiles={selectedFiles}
        />

        {selectedFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            <div className={styles.filesHeader}>
              <Text weight="semibold">
                {selectedFiles.length} file(s) selected
              </Text>
            </div>
            <div className={styles.actions}>
              <Button appearance="secondary" onClick={handleClear}>
                Clear All
              </Button>
              <Button
                appearance="primary"
                icon={<ArrowUpload24Regular />}
                onClick={handleUpload}
                disabled={activeUploads.length > 0}
              >
                Upload & Analyze
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className={styles.progressSection}>
          <Text size={500} weight="semibold">
            Upload Progress
          </Text>
          <UploadProgress uploads={uploadProgress} />
        </div>
      )}

      {/* Tips Card */}
      <Card className={styles.tipsCard}>
        <Text size={400} weight="semibold">
          Tips for best results
        </Text>
        <ul className={styles.tipsList}>
          <li className={styles.tipItem}>
            <Text size={300}>Use high-quality scans with at least 300 DPI</Text>
          </li>
          <li className={styles.tipItem}>
            <Text size={300}>Ensure text is clearly visible and not blurry</Text>
          </li>
          <li className={styles.tipItem}>
            <Text size={300}>Supported formats: PDF, PNG, JPG, JPEG, TIFF, BMP, DOC, DOCX</Text>
          </li>
          <li className={styles.tipItem}>
            <Text size={300}>Maximum file size: 20MB per document</Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DocumentUpload;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Spinner,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  Delete24Regular,
  Document24Regular,
  DocumentPdf24Regular,
  Image24Regular,
  Calendar24Regular,
  Storage24Regular,
  CheckmarkCircle24Filled,
  Clock24Regular,
  ArrowSync24Regular,
  ErrorCircle24Filled,
} from '@fluentui/react-icons';
import { fetchDocument, deleteDocument } from '../store/documentsSlice';
import { RootState, AppDispatch } from '../store/store';
import AnalysisResults from '../components/AnalysisResults';
import { DocumentStatus } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  backButton: {
    marginRight: tokens.spacingHorizontalM,
  },
  fileIcon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  fileName: {
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  metaCard: {
    padding: tokens.spacingVerticalL,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  metaIcon: {
    color: tokens.colorNeutralForeground3,
  },
  metaLabel: {
    color: tokens.colorNeutralForeground3,
    display: 'block',
  },
  resultsCard: {
    padding: tokens.spacingVerticalL,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  statusCompleted: {
    color: tokens.colorPaletteGreenForeground1,
  },
  statusProcessing: {
    color: tokens.colorPaletteYellowForeground1,
  },
  statusPending: {
    color: tokens.colorNeutralForeground3,
  },
  statusFailed: {
    color: tokens.colorPaletteRedForeground1,
  },
  processingMessage: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <DocumentPdf24Regular />;
  if (fileType.includes('image')) return <Image24Regular />;
  return <Document24Regular />;
};

const getStatusIcon = (status: DocumentStatus) => {
  switch (status) {
    case 'completed':
      return <CheckmarkCircle24Filled />;
    case 'processing':
      return <ArrowSync24Regular />;
    case 'pending':
      return <Clock24Regular />;
    case 'failed':
      return <ErrorCircle24Filled />;
    default:
      return <Clock24Regular />;
  }
};

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'completed':
      return <Badge appearance="filled" color="success">Completed</Badge>;
    case 'processing':
      return <Badge appearance="filled" color="warning">Processing</Badge>;
    case 'pending':
      return <Badge appearance="filled" color="informative">Pending</Badge>;
    case 'failed':
      return <Badge appearance="filled" color="danger">Failed</Badge>;
    default:
      return <Badge appearance="filled">Unknown</Badge>;
  }
};

const DocumentDetail: React.FC = () => {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentDocument, isLoading, error } = useSelector(
    (state: RootState) => state.documents
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchDocument(id));
    }
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (currentDocument && window.confirm('Are you sure you want to delete this document?')) {
      await dispatch(deleteDocument(currentDocument.id));
      navigate('/history');
    }
  };

  const getStatusClass = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'processing':
        return styles.statusProcessing;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading document details..." />
      </div>
    );
  }

  if (error || !currentDocument) {
    return (
      <div className={styles.errorContainer}>
        <Text size={500}>Document not found</Text>
        <Button appearance="primary" onClick={handleBack} style={{ marginTop: '16px' }}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            appearance="subtle"
            icon={<ArrowLeft24Regular />}
            onClick={handleBack}
            className={styles.backButton}
            aria-label="Go back"
          />
          <span className={styles.fileIcon}>
            {getFileIcon(currentDocument.fileType)}
          </span>
          <div className={styles.titleSection}>
            <Text size={600} weight="bold" className={styles.fileName}>
              {currentDocument.fileName}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={getStatusClass(currentDocument.status)}>
                {getStatusIcon(currentDocument.status)}
              </span>
              {getStatusBadge(currentDocument.status)}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            appearance="secondary"
            icon={<Delete24Regular />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card className={styles.metaCard}>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <Document24Regular className={styles.metaIcon} />
            <div>
              <Text size={200} className={styles.metaLabel}>File Type</Text>
              <Text weight="semibold">{currentDocument.fileType}</Text>
            </div>
          </div>
          <div className={styles.metaItem}>
            <Storage24Regular className={styles.metaIcon} />
            <div>
              <Text size={200} className={styles.metaLabel}>File Size</Text>
              <Text weight="semibold">{formatFileSize(currentDocument.fileSize)}</Text>
            </div>
          </div>
          <div className={styles.metaItem}>
            <Calendar24Regular className={styles.metaIcon} />
            <div>
              <Text size={200} className={styles.metaLabel}>Upload Date</Text>
              <Text weight="semibold">{formatDate(currentDocument.uploadDate)}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      <Card className={styles.resultsCard}>
        <Text size={500} weight="semibold" block style={{ marginBottom: '16px' }}>
          Analysis Results
        </Text>
        <Divider style={{ marginBottom: '16px' }} />
        
        {currentDocument.status === 'completed' && currentDocument.analysisResult ? (
          <AnalysisResults result={currentDocument.analysisResult} />
        ) : currentDocument.status === 'processing' || currentDocument.status === 'pending' ? (
          <div className={styles.processingMessage}>
            <Spinner size="large" />
            <Text size={400} block style={{ marginTop: '16px' }}>
              {currentDocument.status === 'processing' 
                ? 'Analysis in progress...' 
                : 'Waiting to process...'}
            </Text>
            <Text size={300}>
              This may take a few moments depending on document complexity
            </Text>
          </div>
        ) : (
          <div className={styles.processingMessage}>
            <ErrorCircle24Filled style={{ fontSize: '48px', color: tokens.colorPaletteRedForeground1 }} />
            <Text size={400} block style={{ marginTop: '16px' }}>
              Analysis failed
            </Text>
            <Text size={300}>
              Please try uploading the document again
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DocumentDetail;

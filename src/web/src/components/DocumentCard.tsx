import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Badge,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  Document24Regular,
  DocumentPdf24Regular,
  Image24Regular,
  Delete24Regular,
  Eye24Regular,
  CheckmarkCircle24Filled,
  Clock24Regular,
  ArrowSync24Regular,
  ErrorCircle24Filled,
} from '@fluentui/react-icons';
import { Document, DocumentStatus } from '../types';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingVerticalM,
    gap: tokens.spacingHorizontalM,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  icon: {
    fontSize: '32px',
    color: tokens.colorBrandForeground1,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: tokens.spacingVerticalXXS,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
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
});

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

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
    month: 'short',
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

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/document/${document.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(document.id);
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

  return (
    <Card className={styles.card} onClick={handleView}>
      <span className={styles.icon}>{getFileIcon(document.fileType)}</span>
      <div className={styles.info}>
        <Text weight="semibold" className={styles.fileName} block>
          {document.fileName}
        </Text>
        <div className={styles.meta}>
          <Text size={200}>{formatFileSize(document.fileSize)}</Text>
          <Text size={200}>•</Text>
          <Text size={200}>{formatDate(document.uploadDate)}</Text>
        </div>
      </div>
      <div className={styles.status}>
        <span className={getStatusClass(document.status)}>
          {getStatusIcon(document.status)}
        </span>
        {getStatusBadge(document.status)}
      </div>
      <div className={styles.actions}>
        <Tooltip content="View details" relationship="label">
          <Button
            appearance="subtle"
            icon={<Eye24Regular />}
            onClick={handleView}
            aria-label="View document"
          />
        </Tooltip>
        <Tooltip content="Delete" relationship="label">
          <Button
            appearance="subtle"
            icon={<Delete24Regular />}
            onClick={handleDelete}
            aria-label="Delete document"
          />
        </Tooltip>
      </div>
    </Card>
  );
};

export default DocumentCard;

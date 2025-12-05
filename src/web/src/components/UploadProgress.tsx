import React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  ProgressBar,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  ArrowSync24Regular,
  ErrorCircle24Filled,
  ArrowUpload24Regular,
} from '@fluentui/react-icons';
import { UploadProgress as UploadProgressType } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  card: {
    padding: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalS,
  },
  fileName: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusIcon: {
    fontSize: '20px',
  },
  uploading: {
    color: tokens.colorBrandForeground1,
  },
  analyzing: {
    color: tokens.colorPaletteYellowForeground1,
  },
  completed: {
    color: tokens.colorPaletteGreenForeground1,
  },
  failed: {
    color: tokens.colorPaletteRedForeground1,
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
});

interface UploadProgressProps {
  uploads: UploadProgressType[];
}

const getStatusIcon = (status: UploadProgressType['status']) => {
  switch (status) {
    case 'uploading':
      return <ArrowUpload24Regular />;
    case 'analyzing':
      return <ArrowSync24Regular />;
    case 'completed':
      return <CheckmarkCircle24Filled />;
    case 'failed':
      return <ErrorCircle24Filled />;
    default:
      return <ArrowUpload24Regular />;
  }
};

const getStatusText = (status: UploadProgressType['status']): string => {
  switch (status) {
    case 'uploading':
      return 'Uploading...';
    case 'analyzing':
      return 'Analyzing document...';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

const UploadProgress: React.FC<UploadProgressProps> = ({ uploads }) => {
  const styles = useStyles();

  if (uploads.length === 0) return null;

  const getStatusClass = (status: UploadProgressType['status']) => {
    switch (status) {
      case 'uploading':
        return styles.uploading;
      case 'analyzing':
        return styles.analyzing;
      case 'completed':
        return styles.completed;
      case 'failed':
        return styles.failed;
      default:
        return styles.uploading;
    }
  };

  return (
    <div className={styles.container}>
      {uploads.map((upload, index) => (
        <Card key={index} className={styles.card}>
          <div className={styles.header}>
            <span className={`${styles.statusIcon} ${getStatusClass(upload.status)}`}>
              {getStatusIcon(upload.status)}
            </span>
            <Text weight="semibold" className={styles.fileName}>
              {upload.fileName}
            </Text>
          </div>
          <ProgressBar
            value={upload.progress / 100}
            color={upload.status === 'failed' ? 'error' : upload.status === 'completed' ? 'success' : 'brand'}
          />
          <div className={styles.progressText}>
            <Text size={200}>{getStatusText(upload.status)}</Text>
            <Text size={200}>{upload.progress}%</Text>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UploadProgress;

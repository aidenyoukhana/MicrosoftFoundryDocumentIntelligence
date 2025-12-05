import React, { useCallback } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  shorthands,
} from '@fluentui/react-components';
import {
  DocumentAdd48Regular,
  Document24Regular,
  DocumentPdf24Regular,
  Image24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  dropzone: {
    ...shorthands.border('2px', 'dashed', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.padding(tokens.spacingVerticalXXL),
    textAlign: 'center',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.2s',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  dropzoneActive: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground2,
  },
  icon: {
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalM,
  },
  title: {
    marginBottom: tokens.spacingVerticalS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  formats: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
  },
  formatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
  },
  fileList: {
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
  },
  fileName: {
    flex: 1,
  },
  fileSize: {
    color: tokens.colorNeutralForeground3,
  },
});

interface DocumentDropzoneProps {
  onFilesDropped: (files: File[]) => void;
  acceptedFiles?: File[];
  maxFiles?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <DocumentPdf24Regular />;
  if (fileType.includes('image')) return <Image24Regular />;
  return <Document24Regular />;
};

const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onFilesDropped,
  acceptedFiles = [],
  maxFiles = 10,
}) => {
  const styles = useStyles();

  const onDrop = useCallback((accepted: File[], _rejected: FileRejection[], _event: DropEvent) => {
    if (accepted.length > 0) {
      onFilesDropped(accepted);
    }
  }, [onFilesDropped]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
      >
        <input {...getInputProps()} />
        <DocumentAdd48Regular className={styles.icon} />
        <Text size={500} weight="semibold" className={styles.title} block>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Text>
        <Text size={300} className={styles.subtitle} block>
          or click to browse from your computer
        </Text>
        <div className={styles.formats}>
          <span className={styles.formatItem}>
            <DocumentPdf24Regular />
            <Text size={200}>PDF</Text>
          </span>
          <span className={styles.formatItem}>
            <Image24Regular />
            <Text size={200}>Images</Text>
          </span>
          <span className={styles.formatItem}>
            <Document24Regular />
            <Text size={200}>Documents</Text>
          </span>
        </div>
      </div>

      {acceptedFiles.length > 0 && (
        <div className={styles.fileList}>
          {acceptedFiles.map((file, index) => (
            <Card key={index} className={styles.fileItem}>
              {getFileIcon(file.type)}
              <Text className={styles.fileName}>{file.name}</Text>
              <Text size={200} className={styles.fileSize}>
                {formatFileSize(file.size)}
              </Text>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentDropzone;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  tokens,
  Text,
  Input,
  Dropdown,
  Option,
  Spinner,
  Button,
} from '@fluentui/react-components';
import {
  Search24Regular,
  ArrowClockwise24Regular,
} from '@fluentui/react-icons';
import DocumentCard from '../components/DocumentCard';
import { fetchDocuments, deleteDocument } from '../store/documentsSlice';
import { RootState, AppDispatch } from '../store/store';
import { DocumentStatus } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  searchInput: {
    minWidth: '300px',
    flex: 1,
    maxWidth: '400px',
  },
  filterDropdown: {
    minWidth: '150px',
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
    marginBottom: tokens.spacingVerticalM,
  },
  emptyText: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    color: tokens.colorNeutralForeground3,
  },
});

const DocumentHistory: React.FC = () => {
  const styles = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, isLoading } = useSelector((state: RootState) => state.documents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDocuments());
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dispatch(deleteDocument(id));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = documents.filter(d => d.status === 'completed').length;
  const processingCount = documents.filter(d => d.status === 'processing').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const failedCount = documents.filter(d => d.status === 'failed').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Text size={800} weight="bold">
          Document History
        </Text>
        <Text size={400} className={styles.subtitle}>
          Browse and manage all your processed documents
        </Text>
        <div className={styles.stats}>
          <Text size={200}>{documents.length} total</Text>
          <Text size={200}>•</Text>
          <Text size={200}>{completedCount} completed</Text>
          <Text size={200}>•</Text>
          <Text size={200}>{processingCount} processing</Text>
          <Text size={200}>•</Text>
          <Text size={200}>{pendingCount} pending</Text>
          {failedCount > 0 && (
            <>
              <Text size={200}>•</Text>
              <Text size={200}>{failedCount} failed</Text>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Input
          className={styles.searchInput}
          contentBefore={<Search24Regular />}
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
        />
        <Dropdown
          className={styles.filterDropdown}
          value={statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          onOptionSelect={(_, data) => {
            const value = data.optionValue as DocumentStatus | 'all';
            setStatusFilter(value);
          }}
        >
          <Option text="All Status" value="all">All Status</Option>
          <Option text="Completed" value="completed">Completed</Option>
          <Option text="Processing" value="processing">Processing</Option>
          <Option text="Pending" value="pending">Pending</Option>
          <Option text="Failed" value="failed">Failed</Option>
        </Dropdown>
        <Button
          icon={<ArrowClockwise24Regular />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner label="Loading documents..." />
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className={styles.documentList}>
          {filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Search24Regular className={styles.emptyIcon} />
          <Text size={400} className={styles.emptyText} block>
            {searchQuery || statusFilter !== 'all'
              ? 'No documents match your filters'
              : 'No documents yet'}
          </Text>
          {!searchQuery && statusFilter === 'all' && (
            <Text size={300}>
              Upload your first document to get started with AI-powered analysis
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentHistory;

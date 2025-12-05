import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Spinner,
} from '@fluentui/react-components';
import {
  DocumentAdd24Regular,
  DocumentSearch24Regular,
  CheckmarkCircle24Regular,
  Clock24Regular,
  ArrowRight24Regular,
} from '@fluentui/react-icons';
import { fetchDocuments } from '../store/documentsSlice';
import { RootState, AppDispatch } from '../store/store';
import DocumentCard from '../components/DocumentCard';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  title: {
    marginBottom: tokens.spacingVerticalS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  statCard: {
    padding: tokens.spacingVerticalL,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statIconBlue: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  statIconGreen: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground1,
  },
  statIconYellow: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground1,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    display: 'block',
    marginBottom: tokens.spacingVerticalXXS,
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  quickActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
  },
  actionCard: {
    flex: 1,
    padding: tokens.spacingVerticalL,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  actionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  actionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
});

const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, isLoading } = useSelector((state: RootState) => state.documents);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const completedCount = documents.filter(d => d.status === 'completed').length;
  const processingCount = documents.filter(d => d.status === 'processing' || d.status === 'pending').length;

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div>
        <Text size={800} weight="bold" className={styles.title} block>
          Dashboard
        </Text>
        <Text size={400} className={styles.subtitle}>
          Welcome to Document Intelligence - AI-powered document processing
        </Text>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Card className={styles.actionCard} onClick={() => navigate('/upload')}>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>
              <DocumentAdd24Regular />
            </div>
            <div>
              <Text weight="semibold" block>Upload Documents</Text>
              <Text size={200}>Process new documents with AI</Text>
            </div>
          </div>
        </Card>
        <Card className={styles.actionCard} onClick={() => navigate('/history')}>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>
              <DocumentSearch24Regular />
            </div>
            <div>
              <Text weight="semibold" block>View History</Text>
              <Text size={200}>Browse all processed documents</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <DocumentSearch24Regular />
          </div>
          <div className={styles.statInfo}>
            <Text size={700} weight="bold" className={styles.statValue}>
              {documents.length}
            </Text>
            <Text size={300} className={styles.statLabel}>
              Total Documents
            </Text>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <CheckmarkCircle24Regular />
          </div>
          <div className={styles.statInfo}>
            <Text size={700} weight="bold" className={styles.statValue}>
              {completedCount}
            </Text>
            <Text size={300} className={styles.statLabel}>
              Completed
            </Text>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
            <Clock24Regular />
          </div>
          <div className={styles.statInfo}>
            <Text size={700} weight="bold" className={styles.statValue}>
              {processingCount}
            </Text>
            <Text size={300} className={styles.statLabel}>
              In Progress
            </Text>
          </div>
        </Card>
      </div>

      {/* Recent Documents */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text size={500} weight="semibold">
            Recent Documents
          </Text>
          <Button
            appearance="subtle"
            icon={<ArrowRight24Regular />}
            iconPosition="after"
            onClick={() => navigate('/history')}
          >
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner label="Loading documents..." />
          </div>
        ) : recentDocuments.length > 0 ? (
          <div className={styles.recentList}>
            {recentDocuments.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Text>No documents yet. Upload your first document to get started.</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

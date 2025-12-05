import React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  DocumentSearch24Regular,
  Table24Regular,
  TextDescription24Regular,
} from '@fluentui/react-icons';
import { AnalysisResult, ExtractedField } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentType: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  confidence: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  section: {
    marginTop: tokens.spacingVerticalM,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  fieldCard: {
    padding: tokens.spacingVerticalM,
  },
  fieldName: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalXXS,
  },
  fieldValue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceBadge: {
    marginLeft: tokens.spacingHorizontalS,
  },
  highConfidence: {
    color: tokens.colorPaletteGreenForeground1,
  },
  mediumConfidence: {
    color: tokens.colorPaletteYellowForeground1,
  },
  lowConfidence: {
    color: tokens.colorPaletteRedForeground1,
  },
  rawText: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    maxHeight: '200px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
  },
});

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const getConfidenceColor = (confidence: number): "success" | "warning" | "danger" => {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'danger';
};

const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(0)}%`;
};

const FieldCard: React.FC<{ field: ExtractedField }> = ({ field }) => {
  const styles = useStyles();

  return (
    <Card className={styles.fieldCard}>
      <Text size={200} className={styles.fieldName} block>
        {field.fieldName}
      </Text>
      <div className={styles.fieldValue}>
        <Text weight="semibold">{field.value}</Text>
        <Badge
          appearance="tint"
          color={getConfidenceColor(field.confidence)}
          className={styles.confidenceBadge}
        >
          {formatConfidence(field.confidence)}
        </Badge>
      </div>
    </Card>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* Document Type Header */}
      <div className={styles.header}>
        <div className={styles.documentType}>
          <DocumentSearch24Regular />
          <Text size={500} weight="semibold">
            {result.documentType}
          </Text>
        </div>
        <div className={styles.confidence}>
          <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} />
          <Text>Overall Confidence: </Text>
          <Badge appearance="filled" color={getConfidenceColor(result.confidence)}>
            {formatConfidence(result.confidence)}
          </Badge>
        </div>
      </div>

      <Divider />

      {/* Extracted Fields */}
      {result.extractedFields && result.extractedFields.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Table24Regular />
            <Text size={400} weight="semibold">
              Extracted Fields
            </Text>
          </div>
          <div className={styles.fieldsGrid}>
            {result.extractedFields.map((field, index) => (
              <FieldCard key={index} field={field} />
            ))}
          </div>
        </div>
      )}

      {/* Raw Text */}
      {result.rawText && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <TextDescription24Regular />
            <Text size={400} weight="semibold">
              Extracted Text
            </Text>
          </div>
          <div className={styles.rawText}>
            {result.rawText}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

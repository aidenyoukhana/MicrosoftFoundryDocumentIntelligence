import React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Avatar,
} from '@fluentui/react-components';
import {
  DocumentSearch24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: tokens.shadow4,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  logoIcon: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
  title: {
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  settingsButton: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

const Header: React.FC = () => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <DocumentSearch24Regular className={styles.logoIcon} />
        <Text size={500} className={styles.title}>
          Document Intelligence
        </Text>
      </div>
      <div className={styles.actions}>
        <Button
          appearance="subtle"
          icon={<Settings24Regular />}
          className={styles.settingsButton}
          aria-label="Settings"
        />
        <Avatar
          name="User"
          size={32}
          color="colorful"
        />
      </div>
    </header>
  );
};

export default Header;

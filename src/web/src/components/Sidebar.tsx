import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Home24Filled,
  ArrowUpload24Regular,
  ArrowUpload24Filled,
  History24Regular,
  History24Filled,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  sidebar: {
    width: '240px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingVerticalM,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  navLinkActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    '&:hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  icon: {
    fontSize: '24px',
  },
});

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, activeIcon }) => {
  const styles = useStyles();
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <span className={styles.icon}>{isActive ? activeIcon : icon}</span>
          <Text>{label}</Text>
        </>
      )}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const styles = useStyles();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <NavItem
          to="/"
          label="Dashboard"
          icon={<Home24Regular />}
          activeIcon={<Home24Filled />}
        />
        <NavItem
          to="/upload"
          label="Upload Documents"
          icon={<ArrowUpload24Regular />}
          activeIcon={<ArrowUpload24Filled />}
        />
        <NavItem
          to="/history"
          label="Document History"
          icon={<History24Regular />}
          activeIcon={<History24Filled />}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;

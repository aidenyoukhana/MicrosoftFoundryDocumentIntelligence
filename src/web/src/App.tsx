import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import DocumentHistory from './pages/DocumentHistory';
import DocumentDetail from './pages/DocumentDetail';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: tokens.spacingVerticalXXL,
    overflowY: 'auto',
  },
});

const App: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/history" element={<DocumentHistory />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;

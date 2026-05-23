import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import OverviewTab from './components/overview/OverviewTab';
import ReconciliationTab from './components/reconciliation/ReconciliationTab';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container" style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab />
            </motion.div>
          )}
          {activeTab === 'reconciliation' && (
            <motion.div
              key="reconciliation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReconciliationTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        Konix Reconciliation Engine &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
}

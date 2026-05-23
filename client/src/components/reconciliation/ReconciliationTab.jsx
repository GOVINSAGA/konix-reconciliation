import { motion } from 'framer-motion';
import ConfigPanel from './ConfigPanel';
import RunTrigger from './RunTrigger';
import SummaryCards from './SummaryCards';
import ResultsTable from './ResultsTable';
import ReportDownload from './ReportDownload';
import { useReconciliation } from '../../hooks/useReconciliation';
import './ReconciliationTab.css';

export default function ReconciliationTab() {
  const {
    loading,
    error,
    runId,
    summary,
    results,
    runHistory,
    runReconciliation,
    loadRun,
    setError,
  } = useReconciliation();

  return (
    <motion.div
      className="reconciliation-tab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      
      {error && (
        <motion.div
          className="error-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>⚠️ {error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </motion.div>
      )}

      <div className="controls-row">
        <ConfigPanel onRun={runReconciliation} loading={loading} />
        <RunTrigger
          runId={runId}
          loading={loading}
          runHistory={runHistory}
          onLoadRun={loadRun}
        />
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SummaryCards summary={summary} />
        </motion.div>
      )}

      {runId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportDownload runId={runId} />
        </motion.div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ResultsTable results={results} />
        </motion.div>
      )}

      {!runId && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <h3>No Reconciliation Run Yet</h3>
          <p>Configure tolerances above and click <strong>"Run Reconciliation"</strong> to start.</p>
        </div>
      )}
    </motion.div>
  );
}

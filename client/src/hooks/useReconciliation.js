import { useState, useCallback } from 'react';
import {
  triggerReconciliation,
  getReport,
  getSummary,
  getUnmatched,
} from '../services/api';

export function useReconciliation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runId, setRunId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [unmatchedResults, setUnmatchedResults] = useState([]);
  const [runHistory, setRunHistory] = useState([]);

  const runReconciliation = useCallback(async (config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await triggerReconciliation(config);
      if (data.success) {
        setRunId(data.runId);
        setSummary(data.summary);
        setRunHistory((prev) => [
          { runId: data.runId, timestamp: new Date().toISOString(), config: data.config },
          ...prev,
        ]);
        
        const reportData = await getReport(data.runId);
        setResults(reportData.results || []);
        
        const unmatchedData = await getUnmatched(data.runId);
        setUnmatchedResults(unmatchedData.results || []);
      } else {
        setError(data.error || 'Reconciliation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRun = useCallback(async (existingRunId) => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await getSummary(existingRunId);
      setSummary(summaryData.summary);
      setRunId(existingRunId);

      const reportData = await getReport(existingRunId);
      setResults(reportData.results || []);

      const unmatchedData = await getUnmatched(existingRunId);
      setUnmatchedResults(unmatchedData.results || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load run');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    runId,
    summary,
    results,
    unmatchedResults,
    runHistory,
    runReconciliation,
    loadRun,
    setError,
  };
}

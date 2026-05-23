import { HiOutlineClipboardDocument } from 'react-icons/hi2';
import './RunTrigger.css';

export default function RunTrigger({ runId, loading, runHistory, onLoadRun }) {
  const copyRunId = () => {
    if (runId) {
      navigator.clipboard.writeText(runId);
    }
  };

  return (
    <div className="run-trigger glass-card">
      <h3>Run Status</h3>

      {loading && (
        <div className="run-status processing">
          <div className="spinner"></div>
          <span>Processing reconciliation...</span>
        </div>
      )}

      {runId && !loading && (
        <div className="run-status success">
          <span className="run-label">Current Run ID</span>
          <div className="run-id-row">
            <code className="run-id">{runId}</code>
            <button className="btn btn-ghost copy-btn" onClick={copyRunId} title="Copy to clipboard">
              <HiOutlineClipboardDocument />
            </button>
          </div>
        </div>
      )}

      {!runId && !loading && (
        <div className="run-status idle">
          <span>No active run. Configure and trigger a reconciliation.</span>
        </div>
      )}

      {runHistory.length > 0 && (
        <div className="run-history">
          <span className="history-label">Run History</span>
          <div className="history-list">
            {runHistory.slice(0, 5).map((r, i) => (
              <button
                key={r.runId}
                className={`history-item ${r.runId === runId ? 'history-active' : ''}`}
                onClick={() => onLoadRun(r.runId)}
              >
                <span className="history-idx">#{i + 1}</span>
                <span className="history-id">{r.runId.slice(0, 8)}...</span>
                <span className="history-time">
                  {new Date(r.timestamp).toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

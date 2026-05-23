import './ArchitectureDiagram.css';

export default function ArchitectureDiagram() {
  return (
    <div className="arch-diagram glass-card">
      <div className="arch-flow">
        
        <div className="arch-column">
          <div className="arch-node arch-source">
            <div className="arch-node-icon">📄</div>
            <div className="arch-node-label">User CSV</div>
            <div className="arch-node-sub">user_transactions.csv</div>
          </div>
          <div className="arch-node arch-source">
            <div className="arch-node-icon">📄</div>
            <div className="arch-node-label">Exchange CSV</div>
            <div className="arch-node-sub">exchange_transactions.csv</div>
          </div>
        </div>

        <div className="arch-arrow">→</div>

        <div className="arch-column">
          <div className="arch-node arch-process">
            <div className="arch-node-icon">⚙️</div>
            <div className="arch-node-label">Ingestion</div>
            <div className="arch-node-sub">Parse · Validate · Normalize</div>
          </div>
        </div>

        <div className="arch-arrow">→</div>

        <div className="arch-column">
          <div className="arch-node arch-db">
            <div className="arch-node-icon">🗄️</div>
            <div className="arch-node-label">MongoDB</div>
            <div className="arch-node-sub">Transactions · Runs · Results</div>
          </div>
        </div>

        <div className="arch-arrow">→</div>

        <div className="arch-column">
          <div className="arch-node arch-process">
            <div className="arch-node-icon">🔀</div>
            <div className="arch-node-label">Matching Engine</div>
            <div className="arch-node-sub">Greedy Best-Match</div>
          </div>
        </div>

        <div className="arch-arrow">→</div>

        <div className="arch-column">
          <div className="arch-node arch-output">
            <div className="arch-node-icon">📊</div>
            <div className="arch-node-label">Report</div>
            <div className="arch-node-sub">JSON · CSV · API</div>
          </div>
        </div>
      </div>

      <div className="arch-categories">
        <div className="arch-cat matched">✅ Matched</div>
        <div className="arch-cat conflicting">⚠️ Conflicting</div>
        <div className="arch-cat unmatched">❌ Unmatched (User)</div>
        <div className="arch-cat unmatched">❌ Unmatched (Exchange)</div>
      </div>
    </div>
  );
}

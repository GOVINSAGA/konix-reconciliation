import { motion } from 'framer-motion';
import './WorkflowSteps.css';

const steps = [
  {
    step: '01',
    title: 'Ingest CSV Files',
    description: 'Both user and exchange CSV files are streamed and parsed row by row. Each row is tracked with its original line number.',
    color: '#3b82f6',
  },
  {
    step: '02',
    title: 'Validate & Normalize',
    description: 'Every row undergoes validation (timestamp, type, quantity). Asset names are normalized (bitcoin → BTC). Invalid rows are flagged, never dropped.',
    color: '#B0E4CC',
  },
  {
    step: '03',
    title: 'Detect Duplicates',
    description: 'Rows are hashed on key fields to detect exact duplicates. The first occurrence is kept for matching; duplicates are flagged.',
    color: '#408A71',
  },
  {
    step: '04',
    title: 'Match Transactions',
    description: 'The matching engine pairs user → exchange transactions using configurable tolerances for timestamp (±300s) and quantity (±0.01%).',
    color: '#10b981',
  },
  {
    step: '05',
    title: 'Categorize Results',
    description: 'Each pair is categorized as Matched (within tolerance), Conflicting (near-miss exceeding tolerance), or Unmatched (no pair found).',
    color: '#f59e0b',
  },
  {
    step: '06',
    title: 'Generate Report',
    description: 'Results are stored in MongoDB and available via REST API as JSON or downloadable CSV, with full audit trail and reasons.',
    color: '#ef4444',
  },
];

export default function WorkflowSteps() {
  return (
    <div className="workflow-steps">
      {steps.map((s, i) => (
        <motion.div
          key={s.step}
          className="workflow-step glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <div
            className="step-number"
            style={{ background: `${s.color}15`, color: s.color, borderColor: `${s.color}30` }}
          >
            {s.step}
          </div>
          <div className="step-content">
            <h4>{s.title}</h4>
            <p>{s.description}</p>
          </div>
          {i < steps.length - 1 && <div className="step-connector" />}
        </motion.div>
      ))}
    </div>
  );
}

import { motion } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import './SummaryCards.css';

function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {value}
    </motion.span>
  );
}

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: 'Matched',
      value: summary.matched ?? 0,
      icon: <HiOutlineCheckCircle />,
      className: 'card-matched',
    },
    {
      label: 'Conflicting',
      value: summary.conflicting ?? 0,
      icon: <HiOutlineExclamationTriangle />,
      className: 'card-conflicting',
    },
    {
      label: 'Unmatched (User)',
      value: summary.unmatchedUser ?? 0,
      icon: <HiOutlineXCircle />,
      className: 'card-unmatched',
    },
    {
      label: 'Unmatched (Exchange)',
      value: summary.unmatchedExchange ?? 0,
      icon: <HiOutlineXCircle />,
      className: 'card-unmatched',
    },
  ];

  const meta = [
    { label: 'Total User Rows', value: summary.totalUserRows ?? 0 },
    { label: 'Total Exchange Rows', value: summary.totalExchangeRows ?? 0 },
    { label: 'Valid User', value: summary.validUserRows ?? 0 },
    { label: 'Valid Exchange', value: summary.validExchangeRows ?? 0 },
    { label: 'Flagged', value: summary.flaggedRows ?? 0 },
    { label: 'Duplicates', value: summary.duplicateRows ?? 0 },
  ];

  return (
    <div className="summary-section">
      <h3 className="summary-heading">
        <HiOutlineDocumentText /> Reconciliation Summary
      </h3>

      <div className="summary-cards">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            className={`summary-card glass-card ${c.className}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="card-icon">{c.icon}</div>
            <div className="card-value">
              <AnimatedNumber value={c.value} />
            </div>
            <div className="card-label">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="summary-meta glass-card">
        {meta.map((m) => (
          <div key={m.label} className="meta-item">
            <span className="meta-label">{m.label}</span>
            <span className="meta-value">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

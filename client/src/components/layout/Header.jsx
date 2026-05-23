import { motion } from 'framer-motion';
import { HiOutlineCube } from 'react-icons/hi2';
import './Header.css';

export default function Header() {
  return (
    <motion.header
      className="header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-inner container">
        <div className="header-brand">
          <div className="header-logo">
            <HiOutlineCube />
          </div>
          <div>
            <h1 className="header-title">Konix</h1>
            <p className="header-subtitle">Transaction Reconciliation Engine</p>
          </div>
        </div>
        <div className="header-badge">
          <span className="status-dot"></span>
          Production Ready
        </div>
      </div>
    </motion.header>
  );
}

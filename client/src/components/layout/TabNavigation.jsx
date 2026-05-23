import { motion } from 'framer-motion';
import { HiOutlineInformationCircle, HiOutlineCog6Tooth } from 'react-icons/hi2';
import './TabNavigation.css';

const tabs = [
  { id: 'overview', label: 'Overview', icon: <HiOutlineInformationCircle /> },
  { id: 'reconciliation', label: 'Reconciliation', icon: <HiOutlineCog6Tooth /> },
];

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="tab-nav-wrapper">
      <nav className="tab-nav container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

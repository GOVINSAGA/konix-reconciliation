import { motion } from 'framer-motion';
import ArchitectureDiagram from './ArchitectureDiagram';
import WorkflowSteps from './WorkflowSteps';
import TechStack from './TechStack';
import './OverviewTab.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function OverviewTab() {
  return (
    <motion.div
      className="overview-tab"
      variants={container}
      initial="hidden"
      animate="show"
    >
      
      <motion.section className="overview-hero" variants={item}>
        <div className="hero-glow"></div>
        <h2 className="hero-title">
          Crypto Transaction <span className="gradient-text">Reconciliation</span>
        </h2>
        <p className="hero-description">
          A production-grade engine that ingests transaction data from multiple sources,
          intelligently matches them using configurable tolerances, and produces comprehensive
          reconciliation reports — handling messy, real-world data with precision.
        </p>
      </motion.section>

      <motion.section className="overview-section" variants={item}>
        <h3 className="section-title">What It Solves</h3>
        <div className="problem-grid">
          <div className="glass-card problem-card">
            <div className="problem-icon">📊</div>
            <h4>Data Mismatch</h4>
            <p>User-exported and exchange-exported transaction data rarely match perfectly — timestamps drift, quantities differ slightly, and naming conventions vary.</p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">🔍</div>
            <h4>Quality Issues</h4>
            <p>Real data is messy. Missing timestamps, negative quantities, duplicate rows, and asset aliases (e.g., "bitcoin" vs "BTC") must be detected and handled.</p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">🔗</div>
            <h4>Smart Matching</h4>
            <p>Transactions need intelligent pairing using configurable tolerances for timestamp windows and quantity differences, plus type mapping (TRANSFER_IN ↔ TRANSFER_OUT).</p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">📋</div>
            <h4>Audit Trail</h4>
            <p>Every transaction gets categorized: matched, conflicting, or unmatched — with detailed reasons. Nothing is silently dropped.</p>
          </div>
        </div>
      </motion.section>

      <motion.section className="overview-section" variants={item}>
        <h3 className="section-title">Architecture</h3>
        <ArchitectureDiagram />
      </motion.section>

      <motion.section className="overview-section" variants={item}>
        <h3 className="section-title">How It Works</h3>
        <WorkflowSteps />
      </motion.section>

      <motion.section className="overview-section" variants={item}>
        <h3 className="section-title">Tech Stack</h3>
        <TechStack />
      </motion.section>

      <motion.section className="overview-section" variants={item}>
        <h3 className="section-title">Key Design Decisions</h3>
        <div className="decisions-grid">
          {[
            {
              title: 'Greedy Best-Match Algorithm',
              detail: 'Uses a scoring-based greedy approach for transaction matching. Candidates are scored by timestamp proximity and quantity similarity, then assigned best-first. Optimal for this data scale with clear, auditable logic.',
            },
            {
              title: 'Flag, Never Drop',
              detail: 'Invalid rows (malformed timestamps, negative quantities) are stored with validation errors and excluded from matching — but always visible in reports for complete audit trail.',
            },
            {
              title: 'Bidirectional Type Mapping',
              detail: 'TRANSFER_OUT from the user side maps to TRANSFER_IN on the exchange side (same physical transfer, opposite perspective). Handled symmetrically in the matching engine.',
            },
            {
              title: 'Percentage-Based Quantity Tolerance',
              detail: 'Quantity differences are compared as percentages: |diff| / max(a, b) × 100. This handles both small and large quantities fairly with a single threshold.',
            },
            {
              title: 'Configurable Without Code Changes',
              detail: 'Tolerances can be set via environment variables (.env), config file, or overridden per-run through the API request body — no redeployment needed.',
            },
            {
              title: 'Dockerized 3-Service Stack',
              detail: 'MongoDB + NestJS API + React/Nginx in Docker Compose. One command deploys the full stack. Multi-stage builds keep images minimal.',
            },
          ].map((d, i) => (
            <div key={i} className="glass-card decision-card">
              <h4>{d.title}</h4>
              <p>{d.detail}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

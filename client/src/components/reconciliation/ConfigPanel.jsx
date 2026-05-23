import { useState } from 'react';
import { HiOutlinePlay, HiOutlineArrowPath } from 'react-icons/hi2';
import './ConfigPanel.css';

const DEFAULTS = {
  timestampToleranceSec: 300,
  quantityTolerancePct: 0.01,
};

export default function ConfigPanel({ onRun, loading }) {
  const [timestampTol, setTimestampTol] = useState(DEFAULTS.timestampToleranceSec);
  const [quantityTol, setQuantityTol] = useState(DEFAULTS.quantityTolerancePct);

  const handleRun = () => {
    onRun({
      timestampToleranceSec: timestampTol,
      quantityTolerancePct: quantityTol,
    });
  };

  const handleReset = () => {
    setTimestampTol(DEFAULTS.timestampToleranceSec);
    setQuantityTol(DEFAULTS.quantityTolerancePct);
  };

  return (
    <div className="config-panel glass-card">
      <div className="config-header">
        <h3>Configuration</h3>
        <button className="btn btn-ghost" onClick={handleReset} title="Reset to defaults">
          <HiOutlineArrowPath />
        </button>
      </div>

      <div className="config-field">
        <label>
          Timestamp Tolerance
          <span className="config-value">{timestampTol}s ({(timestampTol / 60).toFixed(1)} min)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1800"
          step="30"
          value={timestampTol}
          onChange={(e) => setTimestampTol(Number(e.target.value))}
          className="config-slider"
        />
        <div className="config-range-labels">
          <span>0s</span>
          <span>30min</span>
        </div>
      </div>

      <div className="config-field">
        <label>
          Quantity Tolerance
          <span className="config-value">{quantityTol}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.01"
          value={quantityTol}
          onChange={(e) => setQuantityTol(Number(e.target.value))}
          className="config-slider"
        />
        <div className="config-range-labels">
          <span>0%</span>
          <span>5%</span>
        </div>
      </div>

      <button className="btn btn-primary config-run-btn" onClick={handleRun} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Processing...
          </>
        ) : (
          <>
            <HiOutlinePlay /> Run Reconciliation
          </>
        )}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi2';
import './ResultsTable.css';

const CATEGORIES = ['all', 'matched', 'conflicting', 'unmatched_user', 'unmatched_exchange'];
const CATEGORY_LABELS = { all: 'All', matched: 'Matched', conflicting: 'Conflicting', unmatched_user: 'Unmatched (User)', unmatched_exchange: 'Unmatched (Exchange)' };
const PAGE_SIZE = 15;

export default function ResultsTable({ results }) {
  const [filter, setFilter] = useState('all');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [page, setPage] = useState(0);

  const filtered = filter === 'all' ? results : results.filter((r) => r.category === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageResults = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getBadgeClass = (cat) => {
    if (cat === 'matched') return 'badge badge-matched';
    if (cat === 'conflicting') return 'badge badge-conflicting';
    return 'badge badge-unmatched';
  };

  return (
    <div className="results-section">
      <h3 className="results-heading">Detailed Results</h3>
      <div className="filter-tabs">
        {CATEGORIES.map((c) => {
          const count = c === 'all' ? results.length : results.filter((r) => r.category === c).length;
          return (
            <button key={c} className={`filter-tab ${filter === c ? 'filter-active' : ''}`} onClick={() => { setFilter(c); setPage(0); }}>
              {CATEGORY_LABELS[c]} <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="table-wrapper glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Category</th>
              <th>User TX</th>
              <th>Exchange TX</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Qty Diff</th>
              <th>Time Diff</th>
            </tr>
          </thead>
          <tbody>
            {pageResults.map((r, i) => {
              const globalIdx = page * PAGE_SIZE + i;
              const isExpanded = expandedIdx === globalIdx;
              return (
                <>
                  <tr key={globalIdx} className="result-row" onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}>
                    <td>{isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}</td>
                    <td><span className={getBadgeClass(r.category)}>{r.category.replace('_', ' ')}</span></td>
                    <td className="mono">{r.userTransaction?.transactionId || '—'}</td>
                    <td className="mono">{r.exchangeTransaction?.transactionId || '—'}</td>
                    <td>{r.userTransaction?.asset || r.exchangeTransaction?.asset || '—'}</td>
                    <td>{r.userTransaction?.type || r.exchangeTransaction?.type || '—'}</td>
                    <td>{r.matchDetails ? `${r.matchDetails.quantityDiffPct.toFixed(4)}%` : '—'}</td>
                    <td>{r.matchDetails ? `${r.matchDetails.timestampDiffSec}s` : '—'}</td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${globalIdx}-detail`} className="detail-row">
                      <td colSpan={8}>
                        <div className="detail-content">
                          <div className="detail-reason"><strong>Reason:</strong> {r.reason}</div>
                          <div className="detail-compare">
                            {r.userTransaction && (
                              <div className="detail-side">
                                <h5>User Transaction</h5>
                                <div className="detail-fields">
                                  <span><b>ID:</b> {r.userTransaction.transactionId}</span>
                                  <span><b>Time:</b> {r.userTransaction.timestamp || 'N/A'}</span>
                                  <span><b>Type:</b> {r.userTransaction.type}</span>
                                  <span><b>Asset:</b> {r.userTransaction.asset}</span>
                                  <span><b>Qty:</b> {r.userTransaction.quantity}</span>
                                  <span><b>Price:</b> {r.userTransaction.priceUsd ?? 'N/A'}</span>
                                  <span><b>Fee:</b> {r.userTransaction.fee ?? 'N/A'}</span>
                                  <span><b>Note:</b> {r.userTransaction.note || '—'}</span>
                                </div>
                              </div>
                            )}
                            {r.exchangeTransaction && (
                              <div className="detail-side">
                                <h5>Exchange Transaction</h5>
                                <div className="detail-fields">
                                  <span><b>ID:</b> {r.exchangeTransaction.transactionId}</span>
                                  <span><b>Time:</b> {r.exchangeTransaction.timestamp || 'N/A'}</span>
                                  <span><b>Type:</b> {r.exchangeTransaction.type}</span>
                                  <span><b>Asset:</b> {r.exchangeTransaction.asset}</span>
                                  <span><b>Qty:</b> {r.exchangeTransaction.quantity}</span>
                                  <span><b>Price:</b> {r.exchangeTransaction.priceUsd ?? 'N/A'}</span>
                                  <span><b>Fee:</b> {r.exchangeTransaction.fee ?? 'N/A'}</span>
                                  <span><b>Note:</b> {r.exchangeTransaction.note || '—'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

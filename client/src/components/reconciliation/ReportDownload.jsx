import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { getCsvDownloadUrl } from '../../services/api';
import './ReportDownload.css';

export default function ReportDownload({ runId }) {
  return (
    <div className="download-section">
      <a href={getCsvDownloadUrl(runId)} className="btn btn-secondary download-btn" download>
        <HiOutlineArrowDownTray /> Download Full CSV Report
      </a>
    </div>
  );
}

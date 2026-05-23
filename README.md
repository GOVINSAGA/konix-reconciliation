# Konix — Transaction Reconciliation Engine

A production-grade **Transaction Reconciliation Engine** built with **NestJS**, **MongoDB**, and **React + Vite**. Ingests user and exchange crypto transaction CSVs, matches them with configurable tolerances, and produces structured reconciliation reports.

## Quick Start

### Prerequisites
- **Node.js** 20+
- **MongoDB** running locally on port 27017 (or via Docker)
- **Docker & Docker Compose** (for containerized deployment)

### Option 1: Docker (Recommended)
```bash
git clone <repo-url>
cd konix-reconciliation
docker compose up -d --build
```
Access the app at `http://localhost` (frontend) and `http://localhost:3000` (API directly).

### Option 2: Local Development
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start NestJS backend
cd server
cp .env.example .env
npm install
npm run start:dev

# Terminal 3: Start React frontend
cd client
npm install
npm run dev
```
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reconcile` | Trigger reconciliation (accepts optional tolerance overrides) |
| `GET` | `/report/:runId` | Full reconciliation report (JSON, or `?format=csv` for CSV) |
| `GET` | `/report/:runId/summary` | Summary counts only |
| `GET` | `/report/:runId/unmatched` | Unmatched rows with reasons |

### Example: Trigger Reconciliation
```bash
curl -X POST http://localhost:3000/reconcile \
  -H "Content-Type: application/json" \
  -d '{"timestampToleranceSec": 300, "quantityTolerancePct": 0.01}'
```

## Configuration

Tolerances are configurable without code changes:

| Variable | Default | Description |
|----------|---------|-------------|
| `TIMESTAMP_TOLERANCE_SECONDS` | `300` | Max timestamp difference (seconds) for a match |
| `QUANTITY_TOLERANCE_PCT` | `0.01` | Max quantity difference (%) for a match |
| `MONGODB_URI` | `mongodb://localhost:27017/konix-reconciliation` | MongoDB connection string |
| `PORT` | `3000` | Server port |

Set via: `.env` file, environment variables, or request body on `/reconcile`.

## Architecture

```
User CSV ──→ Ingestion ──→ MongoDB ←── Ingestion ←── Exchange CSV
                              │
                      Matching Engine
                       (Greedy Best-Match)
                              │
                    Reconciliation Report
                    ├── ✅ Matched
                    ├── ⚠️ Conflicting
                    ├── ❌ Unmatched (User)
                    └── ❌ Unmatched (Exchange)
```

## Key Design Decisions

### 1. Flag, Never Drop
Invalid rows (malformed timestamps, negative quantities, missing fields) are stored in MongoDB with `isValid: false` and detailed `validationErrors`. They appear in the ingestion summary but are excluded from matching. Nothing is silently discarded.

### 2. Duplicate Detection
Rows are hashed on `(transactionId, timestamp, type, asset, quantity)`. Exact duplicates are flagged with `isDuplicate: true`. The first occurrence participates in matching.

### 3. Type Mapping (TRANSFER_IN ↔ TRANSFER_OUT)
A user's `TRANSFER_OUT` is the same physical transfer as the exchange's `TRANSFER_IN`. The matching engine handles this bidirectionally.

### 4. Asset Alias Resolution
Common crypto names are normalized: `bitcoin` → `BTC`, `ethereum` → `ETH`, etc. The original value is preserved in `rawAsset` for audit.

### 5. Quantity Tolerance (Percentage-Based)
`|diff| / max(a, b) × 100 ≤ threshold`. This handles both large and small quantities fairly. Example: 0.3 vs 0.3001 = 0.033% difference → **conflicting** at default 0.01% tolerance.

### 6. Greedy Best-Match Algorithm
Candidate pairs are scored on timestamp proximity (50%) and quantity similarity (50%). Pairs are assigned greedily (best score first, each transaction used at most once). Efficient and deterministic for this data scale.

### 7. Conflicting vs Unmatched
- **Matched**: All fields within tolerance
- **Conflicting**: Paired by proximity on asset + type, but timestamp or quantity exceeds tolerance
- **Unmatched**: No candidate found at all

### 8. Fee Not a Matching Criterion
Fee differences (e.g., 0.0015 vs 0.002) are included in match details but do NOT affect categorization. Only timestamp and quantity tolerances determine matching.

## Data Quality Issues in Sample Data

| Issue | Row | Handling |
|-------|-----|----------|
| Duplicate | USR-001 (line 17) | Flagged, first occurrence kept |
| Malformed timestamp | USR-018 | Flagged `INVALID_TIMESTAMP`, excluded from matching |
| Missing timestamp + type | USR-024 | Flagged `MISSING_TIMESTAMP` + `MISSING_TYPE` |
| Negative quantity | USR-019 | Flagged `NEGATIVE_QUANTITY` |
| Asset alias | USR-005 (`bitcoin`) | Normalized to `BTC` |
| Type mapping | USR-004 ↔ EXC-1004 | `TRANSFER_OUT` ↔ `TRANSFER_IN` matched |
| Quantity drift | USR-012 ↔ EXC-1012 | 0.3 vs 0.3001 → conflicting at 0.01% |
| Fee drift | USR-010 ↔ EXC-1010 | Noted in details, not a matching criterion |
| Exchange-only | EXC-1024, EXC-1025 | Reported as `unmatched_exchange` |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | NestJS (TypeScript) |
| Database | MongoDB + Mongoose |
| Frontend | React + Vite |
| Styling | Vanilla CSS (dark theme, glassmorphism) |
| Animations | Framer Motion |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |

## Project Structure

```
├── server/             # NestJS backend
│   ├── src/
│   │   ├── config/     # Environment & configuration
│   │   ├── common/     # Shared utilities, constants, filters
│   │   └── modules/
│   │       ├── transactions/     # Transaction schema & service
│   │       └── reconciliation/   # Core engine (ingestion, matching, report)
│   ├── data/           # CSV files
│   └── Dockerfile
├── client/             # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Header, TabNavigation
│   │   │   ├── overview/        # Project explainer tab
│   │   │   └── reconciliation/  # Main app tab
│   │   ├── services/   # API client
│   │   └── hooks/      # Custom React hooks
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## License

MIT

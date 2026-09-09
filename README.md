# MPLAD Sentinel

**AI-assisted monitoring for smarter public infrastructure.**

A prototype for Smart India Hackathon (SIH) that helps government officials monitor
MPLADS (Members of Parliament Local Area Development Scheme) projects by surfacing
projects with unusual cost, schedule and spending patterns — so a small monitoring
team can focus its limited review time where it matters most.

> **This prototype identifies unusual patterns for review and does not determine or
> establish fraud or wrongdoing.** Every score and flag is a starting point for a
> human officer's investigation, not a conclusion.

---

## 1. Problem statement

Under MPLADS, Members of Parliament recommend local development works — roads,
community halls, school infrastructure, toilets, drinking water facilities and
similar public infrastructure — across thousands of constituencies. Government
officials are responsible for making sure these projects progress properly, that
funds are used reasonably, that projects aren't stuck in unexplained delay, and
that near-duplicate projects aren't quietly sanctioned twice. Doing this by hand,
project by project, does not scale.

## 2. Problem context

There is no single national system that automatically triages MPLADS projects by
risk. Monitoring today depends on officials manually reviewing spreadsheets and
reports, which means unusual projects can go unnoticed simply because there are too
many ordinary ones to read through first.

## 3. Solution

MPLAD Sentinel is a **detect → prioritize → explain → review** platform. It ingests
project and spending data, calculates an explainable **Prototype Risk Score** for
every project, and gives officials a ranked, evidence-backed queue: which projects
deserve a closer look first, and exactly why. It never says "fraud detected" —
only "this project has unusual characteristics and should be reviewed." The
investigation and the decision always stay with the officer.

## 4. Key features

- **Overview dashboard** — total projects, funds, completion, delays and high-risk
  counts, plus status/risk distribution, district spread and expenditure-vs-progress
  charts.
- **Priority Review** — every medium/high risk project, ranked, with its top
  anomaly reasons visible at a glance.
- **Projects directory** — full-text search, filters (risk level, status, district,
  project type) and sorting, backed by a live API.
- **Project details** — an animated risk score, a breakdown of exactly which
  signals contributed to it, a project timeline, full project information, and any
  potentially similar/duplicate projects nearby.
- **Analytics** — aggregate cost, progress and anomaly-category patterns across the
  whole portfolio.
- Polished loading, empty and error states throughout; fully responsive down to
  mobile.

## 5. System architecture

```
mplad-sentinel/
├── frontend/     React + Vite + TypeScript + Tailwind + Framer Motion + Recharts
├── backend/      Node.js + Express + TypeScript + SQLite (better-sqlite3)
├── ml/           Notes on the anomaly-detection / risk-scoring approach
├── data/         Generated sample_projects.csv (mirrors the seeded database)
├── database/     SQLite database file lives here at runtime
└── docs/         architecture.md, anomaly-detection.md, api.md
```

The frontend is a single-page app that talks to the backend exclusively over REST
(`/api/...`). The backend computes risk scores on demand from the raw project data
in SQLite — nothing about "why a project is risky" is hardcoded in the UI.

```
 ┌────────────┐      REST/JSON      ┌────────────┐      SQL      ┌──────────┐
 │  Frontend  │  ─────────────────▶ │  Backend   │ ─────────────▶│  SQLite  │
 │ React/Vite │ ◀───────────────── │ Express/TS │ ◀───────────── │  (WAL)   │
 └────────────┘                     └────────────┘                └──────────┘
                                           │
                                           ▼
                                  Risk Engine (services/riskEngine.ts)
                                  cost · delay · expenditure · similarity
```

## 6. Technology stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Recharts,
Lucide React, React Router.

**Backend:** Node.js, Express, TypeScript, better-sqlite3.

**Database:** SQLite (file-based, zero external services).

## 7. Anomaly detection approach

Four independent, explainable checks run for every project (see
`backend/src/services/riskEngine.ts` and `docs/anomaly-detection.md` for details):

1. **Cost anomaly** — a project's cost is compared against the median cost of
   other projects of the same type. A deviation of 35%+ is flagged.
2. **Delay anomaly** — the elapsed time since sanction is compared against the
   project's own expected duration. Projects 2+ months past their expected
   completion date (and not yet completed) are flagged.
3. **Expenditure/progress mismatch** — expenditure percentage is compared to
   physical progress percentage. A gap of 20+ percentage points is flagged.
4. **Similar/duplicate project** — projects of the same type within 5 km
   (haversine distance) are compared using a bag-of-words cosine similarity over
   their type and description text; combined with proximity, this produces a
   0–100% similarity score.

## 8. Risk scoring approach

Each triggered anomaly contributes points (cost up to 30, delay up to 25,
expenditure up to 25, similarity up to 20). The points are summed into a
**Prototype Risk Score** from 0–100:

| Score  | Level  |
|--------|--------|
| 0–39   | LOW    |
| 40–69  | MEDIUM |
| 70–100 | HIGH   |

This weighting is explicitly labelled **"Illustrative anomaly weighting"** in the
UI — it is a prototype model, not an official government scoring rule, and the
thresholds are easy to tune in `riskEngine.ts`.

## 9. Database structure

A single `projects` table holds the source data (see
`backend/src/db/connection.ts` for the exact schema and `database/schema/` for a
standalone copy). Risk scores, reasons and similar-project matches are **not**
stored — they are computed live from the project data every time they're
requested, so the source data stays clean and the logic stays inspectable.

## 10. How to run locally

Requires **Node.js 18+**.

### Backend

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:4000`. On first run it automatically
creates the SQLite database and seeds it with 60+ realistic sample projects — no
manual setup needed. To reseed at any time: `npm run seed`.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the app on `http://localhost:5173`. It talks to the backend at the URL
in `frontend/.env` (`VITE_API_BASE_URL`, defaults to `http://localhost:4000/api`).

Open `http://localhost:5173` and click **"Enter Monitoring Dashboard."**

## 11. Sample API endpoints

| Method | Path                                | Description                              |
|--------|--------------------------------------|-------------------------------------------|
| GET    | `/api/health`                        | Health check                              |
| GET    | `/api/projects`                      | List/search/filter/sort projects          |
| GET    | `/api/projects/:id`                  | Full project details + computed risk      |
| GET    | `/api/projects/high-risk`            | Top medium/high risk projects             |
| GET    | `/api/projects/:id/risk`             | Risk score, level and reasons only        |
| GET    | `/api/projects/:id/similar`          | Nearby projects of the same type          |
| GET    | `/api/projects/filters`              | Distinct districts/types/statuses         |
| GET    | `/api/dashboard/stats`               | Overview stat card values                 |
| GET    | `/api/dashboard/risk-distribution`   | Low/medium/high counts                    |
| GET    | `/api/dashboard/status-distribution` | Completed/ongoing/delayed counts          |
| GET    | `/api/dashboard/district-distribution` | Project counts by district              |
| GET    | `/api/dashboard/expenditure-vs-progress` | Scatter-plot data                     |
| GET    | `/api/analytics/summary`             | Aggregate analytics for the Analytics page|

See `docs/api.md` for full query parameters and example responses.

## 12. Demo script (for SIH judging)

1. Open the app — you land on the MPLAD Sentinel entry screen. Click **"Enter
   Monitoring Dashboard."**
2. The **Overview** page loads: total projects, funds, completed, delayed and
   high-risk counts animate in, followed by the four charts.
3. Scroll to **Priority Review** — the top card is *Community Hall, Ghaziabad*,
   risk score 94, **HIGH RISK**.
4. Click **"View analysis."** The project details page opens with the risk score
   animating in.
5. Read **"Why was this project flagged?"** — cost, delay, expenditure and
   similarity anomalies are each explained in plain language with the exact
   numbers behind them.
6. Scroll to **Risk Score Breakdown** — see exactly how the 94 was composed.
7. Scroll to **Potentially Similar Projects** — two nearby community-hall-type
   projects are surfaced with a similarity percentage, clearly labelled as
   requiring human verification.
8. Go back to **Projects**, filter by **"High risk,"** and confirm only the
   flagged projects remain.
9. Open **Analytics** to show the aggregate view across the whole portfolio.

## 13. Prototype limitations

- All project data is **synthetic and clearly labelled as demo data** — it does
  not represent real MPLADS projects, MPs, constituencies or spending.
- The risk score is a **prototype/illustrative model**, not an official government
  scoring rule, and is not evidence of fraud or wrongdoing.
- The entry screen is a **prototype access screen only** — no authentication is
  implemented.
- Similarity detection uses a lightweight bag-of-words + proximity heuristic,
  chosen for explainability over sophistication.
- The dataset is sized for a convincing demo (60+ projects), not production scale.

## 14. Future improvements

- Real authentication and role-based access for review officers.
- A feedback loop where officer decisions (confirmed anomaly / false positive)
  retrain or recalibrate the weighting.
- Richer comparability groups for the cost baseline (type + district + agency).
- A proper NLP embedding model for similarity instead of bag-of-words cosine
  similarity.
- Map-based visualization of project locations and nearby similarity clusters.
- Pagination and virtualization for the projects table at real-world scale.

---

*Prototype built for Smart India Hackathon 2026. Not an official Government of
India application.*

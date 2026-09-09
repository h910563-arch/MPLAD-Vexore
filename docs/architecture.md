# Architecture

## Overview

MPLAD Sentinel is a conventional three-tier web application: a React single-page
app, a stateless Express REST API, and a SQLite database. There is no queue,
cache, or background worker — the dataset is small enough (dozens to low
hundreds of projects) that every risk score can be computed on demand, live,
in well under a second.

```
Browser (React SPA)
   │  fetch() over HTTP
   ▼
Express API  ──────────────►  services/riskEngine.ts  (pure functions, no I/O)
   │  better-sqlite3 (synchronous)
   ▼
SQLite database (database/mplad_sentinel.db)
```

## Why this stack

- **SQLite** needs no separate database server, which matters for a prototype a
  judge or teammate needs to run in minutes. `better-sqlite3` is synchronous,
  which keeps the data-access code simple and easy to read.
- **Risk is computed, not stored.** The `projects` table only holds source data.
  Every `GET` that needs a risk score calls `computeRisk(project, allProjects)`
  fresh. This means the anomaly logic can be changed in one file
  (`riskEngine.ts`) without any migration or backfill step, and it guarantees the
  UI can never show a stale score.
- **Express + a thin controller/service split** keeps routing (`routes/`),
  request handling (`controllers/`) and business logic (`services/`) separate,
  so the anomaly detection logic is unit-testable independent of HTTP.
- **React Router** drives a client-side SPA with five routes: the landing screen
  and four authenticated-feeling app pages (Overview, Projects, Priority Review,
  Analytics) plus a details route, all inside a shared `AppLayout` (sidebar +
  header + animated route transitions).

## Backend layout

```
backend/src/
├── server.ts               Express app setup, auto-seed on first run
├── db/
│   ├── connection.ts        SQLite connection + schema
│   └── seed.ts               Deterministic sample-data generator
├── models/types.ts          Shared TypeScript types
├── services/
│   ├── riskEngine.ts         Anomaly detection + risk scoring (pure logic)
│   └── projectService.ts     Data-access + aggregation queries
├── controllers/              Request/response glue for each route group
└── routes/                   Express routers
```

## Frontend layout

```
frontend/src/
├── main.tsx / App.tsx        Entry point + route table
├── layouts/                  AppLayout, Sidebar, Header
├── pages/                    Landing, Dashboard, Projects, ProjectDetails,
│                              HighRisk, Analytics
├── components/                Reusable UI: RiskBadge, StatusBadge, ProgressBar,
│                              RiskGauge, AnomalyCard, ProjectTable, charts/…
├── services/api.ts            Typed fetch wrapper around the REST API
├── hooks/useFetch.ts          Small data-fetching hook (loading/error/refetch)
├── types/                     Shared TypeScript types (mirrors the backend)
└── utils/format.ts            Currency/date/number formatting helpers
```

## Data flow example: opening a project's details page

1. `ProjectDetails.tsx` calls `api.getProject(id)` and `api.getSimilarProjects(id)`
   via the `useFetch` hook (parallel requests).
2. The backend's `getProject` controller loads the project row, then calls
   `projectService.getRiskForProject(id)`, which loads **every** project (needed
   for the cost baseline and similarity search) and calls
   `computeRisk(project, allProjects)`.
3. `computeRisk` runs the four anomaly checks, sums their scores, derives a risk
   level, and returns a fully explained `RiskResult` — reasons, severities,
   supporting numbers, and a breakdown by anomaly type.
4. The frontend renders that result directly: the animated `RiskGauge`, the
   `AnomalyCard` list, and the score breakdown bars all come straight from the
   API response with no client-side recomputation.

## Extending the prototype

- To add a new anomaly type, add one function to `riskEngine.ts` that returns an
  `AnomalyReason | null`, add it to the `reasons` array in `computeRisk`, and add
  a label in `ANOMALY_LABELS` on the frontend. Nothing else needs to change.
- To change the risk thresholds, edit `riskLevelFromScore` in `riskEngine.ts`.
- To point the frontend at a different backend, edit `VITE_API_BASE_URL` in
  `frontend/.env`.

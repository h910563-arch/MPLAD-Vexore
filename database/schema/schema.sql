-- MPLAD Sentinel — SQLite schema
-- Source data only. Risk scores, reasons and similarity matches are computed
-- live by the backend's risk engine and are never persisted here.

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId TEXT UNIQUE NOT NULL,           -- e.g. "MPLAD-00142"
  projectName TEXT NOT NULL,
  projectType TEXT NOT NULL,                -- e.g. "Community Hall", "Road Construction"
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  constituency TEXT NOT NULL,
  cost REAL NOT NULL,                       -- sanctioned cost, in INR lakh
  sanctionDate TEXT NOT NULL,               -- ISO date (YYYY-MM-DD)
  expectedCompletionDate TEXT NOT NULL,     -- ISO date (YYYY-MM-DD)
  progressPercentage REAL NOT NULL,         -- 0-100
  expenditurePercentage REAL NOT NULL,      -- 0-100, share of sanctioned funds spent
  implementingAgency TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,                     -- ONGOING | COMPLETED | DELAYED | NOT_STARTED
  recommendationDate TEXT NOT NULL,         -- ISO date (YYYY-MM-DD)
  workStartedDate TEXT                      -- ISO date (YYYY-MM-DD), nullable
);

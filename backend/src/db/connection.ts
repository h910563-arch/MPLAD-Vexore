import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.resolve(__dirname, "../../../database");
const DB_PATH = path.join(DB_DIR, "mplad_sentinel.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId TEXT UNIQUE NOT NULL,
      projectName TEXT NOT NULL,
      projectType TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      constituency TEXT NOT NULL,
      cost REAL NOT NULL,
      sanctionDate TEXT NOT NULL,
      expectedCompletionDate TEXT NOT NULL,
      progressPercentage REAL NOT NULL,
      expenditurePercentage REAL NOT NULL,
      implementingAgency TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      recommendationDate TEXT NOT NULL,
      workStartedDate TEXT
    );
  `);
}

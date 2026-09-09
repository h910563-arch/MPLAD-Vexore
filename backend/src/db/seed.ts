import { db, initSchema } from "./connection";
import fs from "fs";
import path from "path";

// Deterministic PRNG so the demo data is stable across runs.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260909);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => min + rand() * (max - min);
const round1 = (n: number) => Math.round(n * 10) / 10;

interface Region {
  state: string;
  district: string;
  constituency: string;
  lat: number;
  lng: number;
}

const REGIONS: Region[] = [
  { state: "Uttar Pradesh", district: "Ghaziabad", constituency: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { state: "Uttar Pradesh", district: "Lucknow", constituency: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { state: "Bihar", district: "Patna", constituency: "Patna Sahib", lat: 25.5941, lng: 85.1376 },
  { state: "Maharashtra", district: "Nagpur", constituency: "Nagpur", lat: 21.1458, lng: 79.0882 },
  { state: "Maharashtra", district: "Pune", constituency: "Pune", lat: 18.5204, lng: 73.8567 },
  { state: "Rajasthan", district: "Jaipur", constituency: "Jaipur Rural", lat: 26.9124, lng: 75.7873 },
  { state: "Tamil Nadu", district: "Coimbatore", constituency: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { state: "Assam", district: "Guwahati", constituency: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { state: "Madhya Pradesh", district: "Bhopal", constituency: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { state: "Jharkhand", district: "Ranchi", constituency: "Ranchi", lat: 23.3441, lng: 85.3096 },
];

interface ProjectTypeDef {
  type: string;
  baseCost: number; // typical cost in INR lakh
  costSpread: number; // fraction spread e.g. 0.25 = +-25%
  agency: string[];
  descTemplate: (region: Region) => string;
}

const TYPES: ProjectTypeDef[] = [
  {
    type: "Road Construction",
    baseCost: 26,
    costSpread: 0.3,
    agency: ["Public Works Department", "Zilla Parishad"],
    descTemplate: (r) => `Construction and strengthening of internal road connecting local ward in ${r.district}.`,
  },
  {
    type: "Community Hall",
    baseCost: 24,
    costSpread: 0.3,
    agency: ["District Rural Development Agency", "Municipal Corporation"],
    descTemplate: (r) => `Construction of a community hall for public gatherings and local events in ${r.district}.`,
  },
  {
    type: "School Toilet Block",
    baseCost: 12,
    costSpread: 0.25,
    agency: ["District Rural Development Agency", "Zilla Parishad"],
    descTemplate: (r) => `Construction of a toilet block at government school premises in ${r.district}.`,
  },
  {
    type: "Drinking Water Facility",
    baseCost: 14,
    costSpread: 0.28,
    agency: ["Public Health Engineering Department", "Zilla Parishad"],
    descTemplate: (r) => `Installation of a drinking water supply point / hand pump cluster in ${r.district}.`,
  },
  {
    type: "School Infrastructure",
    baseCost: 20,
    costSpread: 0.3,
    agency: ["District Rural Development Agency", "Public Works Department"],
    descTemplate: (r) => `Additional classroom and boundary wall construction at government school in ${r.district}.`,
  },
  {
    type: "Public Park",
    baseCost: 16,
    costSpread: 0.3,
    agency: ["Municipal Corporation"],
    descTemplate: (r) => `Development of a public park with seating and green cover in ${r.district}.`,
  },
  {
    type: "Street Lighting",
    baseCost: 9,
    costSpread: 0.25,
    agency: ["Municipal Corporation", "Public Works Department"],
    descTemplate: (r) => `Installation of solar street lighting along local roads in ${r.district}.`,
  },
  {
    type: "Health Sub-Centre",
    baseCost: 28,
    costSpread: 0.3,
    agency: ["District Rural Development Agency"],
    descTemplate: (r) => `Construction of a primary health sub-centre building in ${r.district}.`,
  },
  {
    type: "Anganwadi Building",
    baseCost: 11,
    costSpread: 0.25,
    agency: ["District Rural Development Agency", "Zilla Parishad"],
    descTemplate: (r) => `Construction of an anganwadi (childcare centre) building in ${r.district}.`,
  },
];

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function jitterLatLng(r: Region, kmRadius: number) {
  // ~1 degree lat = 111km
  const dLat = between(-kmRadius, kmRadius) / 111;
  const dLng = between(-kmRadius, kmRadius) / (111 * Math.cos((r.lat * Math.PI) / 180));
  return { lat: round1_5(r.lat + dLat), lng: round1_5(r.lng + dLng) };
}
function round1_5(n: number) {
  return Math.round(n * 100000) / 100000;
}

const TODAY = new Date("2026-09-09");

type ProfileKind = "normal" | "cost" | "delay" | "expenditure" | "duplicate";

interface SeedRow {
  projectId: string;
  projectName: string;
  projectType: string;
  state: string;
  district: string;
  constituency: string;
  cost: number;
  sanctionDate: string;
  expectedCompletionDate: string;
  progressPercentage: number;
  expenditurePercentage: number;
  implementingAgency: string;
  latitude: number;
  longitude: number;
  description: string;
  status: string;
  recommendationDate: string;
  workStartedDate: string | null;
}

const rows: SeedRow[] = [];
let counter = 100;

function buildProject(typeDef: ProjectTypeDef, region: Region, profile: ProfileKind, forcedLoc?: { lat: number; lng: number }): SeedRow {
  counter += 1;
  const projectId = `MPLAD-${String(counter).padStart(5, "0")}`;

  // Cost
  let cost = typeDef.baseCost * (1 + between(-typeDef.costSpread, typeDef.costSpread));
  if (profile === "cost") cost = typeDef.baseCost * between(1.55, 1.9); // significant overshoot
  cost = round1(cost);

  // Timeline — anchored relative to "today" so elapsed-vs-expected ratios stay realistic
  // (recommendation happened anywhere from ~1.5 to ~19 months before today).
  const recommendationDate = addDays(TODAY.toISOString().slice(0, 10), -Math.floor(between(45, 560)));
  const sanctionDate = addDays(recommendationDate, Math.floor(between(20, 60)));
  const expectedDurationDays = Math.floor(between(150, 270));
  const expectedCompletionDate = addDays(sanctionDate, expectedDurationDays);
  const workStartedDate = addDays(sanctionDate, Math.floor(between(10, 40)));

  const daysElapsedTotal = Math.round((TODAY.getTime() - new Date(sanctionDate).getTime()) / 86400000);
  const daysToExpected = Math.round((new Date(expectedCompletionDate).getTime() - new Date(sanctionDate).getTime()) / 86400000);
  const scheduleRatio = daysElapsedTotal / daysToExpected; // uncapped: >1 means past the expected date
  const expectedProgressNow = Math.min(100, Math.max(0, scheduleRatio * 100));

  let progressPercentage: number;
  let expenditurePercentage: number;
  let status: string;

  if (profile === "delay") {
    progressPercentage = round1(Math.max(15, expectedProgressNow * between(0.35, 0.55)));
    expenditurePercentage = round1(Math.min(100, progressPercentage + between(0, 10)));
    status = "DELAYED";
  } else if (profile === "expenditure") {
    progressPercentage = round1(between(28, 40));
    expenditurePercentage = round1(Math.min(97, progressPercentage + between(38, 55)));
    status = scheduleRatio > 1 ? "DELAYED" : "ONGOING";
  } else if (profile === "cost" || profile === "duplicate") {
    progressPercentage = round1(Math.min(100, Math.max(20, expectedProgressNow * between(0.55, 0.85))));
    expenditurePercentage = round1(Math.min(100, progressPercentage + between(5, 18)));
    status = scheduleRatio > 1.05 ? "DELAYED" : progressPercentage >= 99 ? "COMPLETED" : "ONGOING";
  } else if (scheduleRatio >= between(0.92, 1.08)) {
    // normal, and its expected window has essentially elapsed — wrapped up close to on time.
    progressPercentage = 100;
    expenditurePercentage = round1(between(92, 100));
    status = "COMPLETED";
  } else {
    // normal, still within its expected window — tracks the expected pace closely.
    const wobble = between(-8, 8);
    progressPercentage = round1(Math.min(100, Math.max(5, expectedProgressNow + wobble)));
    expenditurePercentage = round1(Math.min(100, Math.max(0, progressPercentage + between(-6, 8))));
    status = progressPercentage >= 99 ? "COMPLETED" : "ONGOING";
  }
  if (progressPercentage <= 1) status = "NOT_STARTED";

  const loc = forcedLoc ?? jitterLatLng(region, 12);

  return {
    projectId,
    projectName: typeDef.type,
    projectType: typeDef.type,
    state: region.state,
    district: region.district,
    constituency: region.constituency,
    cost,
    sanctionDate,
    expectedCompletionDate,
    progressPercentage,
    expenditurePercentage,
    implementingAgency: pick(typeDef.agency),
    latitude: loc.lat,
    longitude: loc.lng,
    description: typeDef.descTemplate(region),
    status,
    recommendationDate,
    workStartedDate,
  };
}

// --- Build the demo dataset -------------------------------------------------
// Target mix: ~75% normal (low risk), ~17% single-signal medium risk, ~8% high risk (multi-signal)

// 1) Normal baseline projects spread across regions and types
for (let i = 0; i < 34; i++) {
  const region = pick(REGIONS);
  const typeDef = pick(TYPES);
  rows.push(buildProject(typeDef, region, "normal"));
}

// 2) Medium risk: single moderate anomaly each
const mediumRegion1 = REGIONS[1]; // Lucknow
const m1 = buildProject(TYPES.find((t) => t.type === "School Toilet Block")!, mediumRegion1, "delay");
m1.cost = 18;
m1.progressPercentage = 34;
m1.expenditurePercentage = 40;
m1.status = "DELAYED";
m1.sanctionDate = "2025-08-01";
m1.recommendationDate = addDays(m1.sanctionDate, -30);
m1.workStartedDate = addDays(m1.sanctionDate, 15);
m1.expectedCompletionDate = addDays(m1.sanctionDate, 170);
rows.push(m1);

const mediumRegion2 = REGIONS[4]; // Pune
const m2 = buildProject(TYPES.find((t) => t.type === "Street Lighting")!, mediumRegion2, "expenditure");
m2.cost = 13.5;
m2.progressPercentage = 30;
m2.expenditurePercentage = 72;
m2.status = "ONGOING";
rows.push(m2);

const mediumRegion3 = REGIONS[6]; // Coimbatore
const m3 = buildProject(TYPES.find((t) => t.type === "Drinking Water Facility")!, mediumRegion3, "cost");
m3.cost = 22.5;
m3.progressPercentage = 62;
m3.expenditurePercentage = 70;
m3.status = "ONGOING";
rows.push(m3);

const mediumRegion4 = REGIONS[8]; // Bhopal
const m4 = buildProject(TYPES.find((t) => t.type === "Anganwadi Building")!, mediumRegion4, "delay");
m4.cost = 16.5;
m4.progressPercentage = 30;
m4.expenditurePercentage = 38;
m4.status = "DELAYED";
m4.sanctionDate = "2025-07-10";
m4.recommendationDate = addDays(m4.sanctionDate, -28);
m4.workStartedDate = addDays(m4.sanctionDate, 14);
m4.expectedCompletionDate = addDays(m4.sanctionDate, 160);
rows.push(m4);

const mediumRegion5 = REGIONS[2]; // Patna
const m5 = buildProject(TYPES.find((t) => t.type === "School Infrastructure")!, mediumRegion5, "expenditure");
m5.cost = 30;
m5.progressPercentage = 36;
m5.expenditurePercentage = 71;
m5.status = "ONGOING";
rows.push(m5);

const mediumRegion6 = REGIONS[9]; // Ranchi
const m6 = buildProject(TYPES.find((t) => t.type === "Public Park")!, mediumRegion6, "cost");
m6.cost = 25;
m6.progressPercentage = 55;
m6.expenditurePercentage = 82;
m6.status = "ONGOING";
rows.push(m6);

const mediumRegion7 = REGIONS[3]; // Nagpur
const m7 = buildProject(TYPES.find((t) => t.type === "Health Sub-Centre")!, mediumRegion7, "delay");
m7.progressPercentage = 40;
m7.expenditurePercentage = 46;
m7.status = "DELAYED";
m7.sanctionDate = "2025-06-15";
m7.recommendationDate = addDays(m7.sanctionDate, -30);
m7.workStartedDate = addDays(m7.sanctionDate, 18);
m7.expectedCompletionDate = addDays(m7.sanctionDate, 180);
rows.push(m7);

// 3) High risk: multi-signal flagship example (Community Hall, Ghaziabad) + a few more
const ghaziabad = REGIONS[0];
const hallType = TYPES.find((t) => t.type === "Community Hall")!;
const flagship = buildProject(hallType, ghaziabad, "delay");
flagship.cost = 48.4;
flagship.progressPercentage = 32;
flagship.expenditurePercentage = 85;
flagship.status = "DELAYED";
flagship.sanctionDate = "2025-03-10";
flagship.recommendationDate = addDays(flagship.sanctionDate, -35);
flagship.workStartedDate = addDays(flagship.sanctionDate, 22);
flagship.expectedCompletionDate = addDays(flagship.sanctionDate, 240);
rows.push(flagship);

// Duplicate/similar projects near the flagship (within ~3km) — same type & district
const dupLoc1 = { lat: flagship.latitude + 0.0215, lng: flagship.longitude + 0.009 }; // ~2.4km
const dup1 = buildProject(hallType, ghaziabad, "duplicate", dupLoc1);
dup1.projectName = "Community Centre";
dup1.projectType = "Community Hall";
dup1.cost = 22;
dup1.description = `Construction of a community centre for public gatherings and local events in ${ghaziabad.district}, near the existing community hall project.`;
rows.push(dup1);

const dupLoc2 = { lat: flagship.latitude - 0.018, lng: flagship.longitude + 0.02 }; // ~3.1km
const dup2 = buildProject(hallType, ghaziabad, "duplicate", dupLoc2);
dup2.projectName = "Community Hall";
dup2.projectType = "Community Hall";
dup2.cost = 20;
dup2.description = `Construction of a community hall for public gatherings and local events in ${ghaziabad.district} ward area.`;
rows.push(dup2);

// A pure cost + delay outlier in Jaipur
const jaipur = REGIONS[5];
const roadHigh = buildProject(TYPES.find((t) => t.type === "Road Construction")!, jaipur, "cost");
roadHigh.cost = 49;
roadHigh.progressPercentage = 28;
roadHigh.expenditurePercentage = 71;
roadHigh.status = "DELAYED";
roadHigh.sanctionDate = "2025-02-14";
roadHigh.recommendationDate = addDays(roadHigh.sanctionDate, -30);
roadHigh.workStartedDate = addDays(roadHigh.sanctionDate, 18);
roadHigh.expectedCompletionDate = addDays(roadHigh.sanctionDate, 200);
rows.push(roadHigh);

// A pure expenditure/progress mismatch + delay outlier in Guwahati
const guwahati = REGIONS[7];
const waterHigh = buildProject(TYPES.find((t) => t.type === "Drinking Water Facility")!, guwahati, "expenditure");
waterHigh.expenditurePercentage = 93;
waterHigh.progressPercentage = 27;
waterHigh.status = "DELAYED";
waterHigh.sanctionDate = "2025-01-20";
waterHigh.recommendationDate = addDays(waterHigh.sanctionDate, -28);
waterHigh.workStartedDate = addDays(waterHigh.sanctionDate, 15);
waterHigh.expectedCompletionDate = addDays(waterHigh.sanctionDate, 190);
rows.push(waterHigh);

// A cost + delay + expenditure outlier — Anganwadi Building, Bhopal
const bhopalHigh = REGIONS[8];
const anganHigh = buildProject(TYPES.find((t) => t.type === "Anganwadi Building")!, bhopalHigh, "cost");
anganHigh.cost = 19.5;
anganHigh.progressPercentage = 35;
anganHigh.expenditurePercentage = 74;
anganHigh.status = "DELAYED";
anganHigh.sanctionDate = "2025-02-01";
anganHigh.recommendationDate = addDays(anganHigh.sanctionDate, -25);
anganHigh.workStartedDate = addDays(anganHigh.sanctionDate, 12);
anganHigh.expectedCompletionDate = addDays(anganHigh.sanctionDate, 180);
rows.push(anganHigh);

// A severe delay + expenditure outlier — Health Sub-Centre, Nagpur
const nagpurHigh = REGIONS[3];
const healthHigh = buildProject(TYPES.find((t) => t.type === "Health Sub-Centre")!, nagpurHigh, "delay");
healthHigh.cost = 27;
healthHigh.progressPercentage = 22;
healthHigh.expenditurePercentage = 58;
healthHigh.status = "DELAYED";
healthHigh.sanctionDate = "2024-11-05";
healthHigh.recommendationDate = addDays(healthHigh.sanctionDate, -32);
healthHigh.workStartedDate = addDays(healthHigh.sanctionDate, 20);
healthHigh.expectedCompletionDate = addDays(healthHigh.sanctionDate, 200);
rows.push(healthHigh);

// A few more normal projects to round out volume and give every region coverage
for (let i = 0; i < 15; i++) {
  const region = pick(REGIONS);
  const typeDef = pick(TYPES);
  rows.push(buildProject(typeDef, region, "normal"));
}

// --- Persist to DB and CSV --------------------------------------------------
initSchema();
db.exec("DELETE FROM projects;");

const insert = db.prepare(`
  INSERT INTO projects (
    projectId, projectName, projectType, state, district, constituency, cost,
    sanctionDate, expectedCompletionDate, progressPercentage, expenditurePercentage,
    implementingAgency, latitude, longitude, description, status, recommendationDate, workStartedDate
  ) VALUES (
    @projectId, @projectName, @projectType, @state, @district, @constituency, @cost,
    @sanctionDate, @expectedCompletionDate, @progressPercentage, @expenditurePercentage,
    @implementingAgency, @latitude, @longitude, @description, @status, @recommendationDate, @workStartedDate
  )
`);

const insertMany = db.transaction((items: SeedRow[]) => {
  for (const item of items) insert.run(item);
});
insertMany(rows);

// Write CSV copy for data/sample_projects.csv
const csvHeader = Object.keys(rows[0]).join(",");
const csvLines = rows.map((r) =>
  Object.values(r)
    .map((v) => (typeof v === "string" && v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v ?? ""))
    .join(",")
);
const csvPath = path.resolve(__dirname, "../../../data/sample_projects.csv");
fs.writeFileSync(csvPath, [csvHeader, ...csvLines].join("\n"), "utf-8");

console.log(`Seeded ${rows.length} projects into SQLite and wrote ${csvPath}`);

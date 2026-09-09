import express from "express";
import cors from "cors";
import { initSchema, db } from "./db/connection";
import projectRoutes from "./routes/projectRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

initSchema();
// Auto-seed on first run if the table is empty, so `npm run dev` alone works.
const count = (db.prepare("SELECT COUNT(*) as c FROM projects").get() as { c: number }).c;
if (count === 0) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./db/seed");
}

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "mplad-sentinel-backend" }));
app.use("/api/projects", projectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`MPLAD Sentinel backend running at http://localhost:${PORT}`);
});

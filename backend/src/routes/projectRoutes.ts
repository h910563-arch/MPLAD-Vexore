import { Router } from "express";
import * as controller from "../controllers/projectController";

const router = Router();

router.get("/high-risk", controller.getHighRisk);
router.get("/filters", controller.getFilters);
router.get("/:id/risk", controller.getProjectRisk);
router.get("/:id/similar", controller.getProjectSimilar);
router.get("/:id", controller.getProject);
router.get("/", controller.listProjects);

export default router;

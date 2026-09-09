import { Router } from "express";
import * as controller from "../controllers/dashboardController";

const router = Router();

router.get("/stats", controller.getStats);
router.get("/risk-distribution", controller.getRiskDistribution);
router.get("/status-distribution", controller.getStatusDistribution);
router.get("/district-distribution", controller.getDistrictDistribution);
router.get("/expenditure-vs-progress", controller.getExpenditureVsProgress);

export default router;

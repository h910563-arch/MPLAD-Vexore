import { Router } from "express";
import * as controller from "../controllers/analyticsController";

const router = Router();
router.get("/summary", controller.getSummary);

export default router;

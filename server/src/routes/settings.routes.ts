import { Router } from "express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/auth";
import { getSettings, updateSettings } from "../controllers/settings.controller";

const router = Router();
router.get("/", getSettings);
router.put("/", requireAdmin, upload.single("heroImage"), updateSettings);

export default router;
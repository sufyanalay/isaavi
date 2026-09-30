import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import {
  validatePromo, getPromos, createPromo, updatePromo, deletePromo,
} from "../controllers/promo.controller";

const router = Router();

/* Public — cart/checkout par code apply karte waqt (discount server hi lagata hai) */
router.post("/validate", validatePromo);

/* Admin only — promo codes ka poora CRUD */
router.get("/", requireAdmin, getPromos);
router.post("/", requireAdmin, createPromo);
router.put("/:id", requireAdmin, updatePromo);
router.delete("/:id", requireAdmin, deletePromo);

export default router;

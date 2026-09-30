import { Router } from "express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/auth";
import {
  getActiveOffers, getAllOffers, createOffer, updateOffer, deleteOffer,
} from "../controllers/offer.controller";

const router = Router();

/* Public — sirf active offers storefront par jate hain */
router.get("/", getActiveOffers);

/* Admin only */
router.get("/all", requireAdmin, getAllOffers);
router.post("/", requireAdmin, upload.single("image"), createOffer);
router.put("/:id", requireAdmin, upload.single("image"), updateOffer);
router.delete("/:id", requireAdmin, deleteOffer);

export default router;
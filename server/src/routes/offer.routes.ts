import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import {
  getActiveOffers, getAllOffers, createOffer, updateOffer, deleteOffer,
} from "../controllers/offer.controller";

const router = Router();

/* Public — sirf active offers storefront par jate hain */
router.get("/", getActiveOffers);

/* Admin only — offers me image nahi hoti, isliye JSON body chalti hai */
router.get("/all", requireAdmin, getAllOffers);
router.post("/", requireAdmin, createOffer);
router.put("/:id", requireAdmin, updateOffer);
router.delete("/:id", requireAdmin, deleteOffer);

export default router;
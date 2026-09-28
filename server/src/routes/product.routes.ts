import { Router } from "express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/auth";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  removeProductImage,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

// Public — storefront yahan se products lega
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin only — image upload ke saath
router.post("/", requireAdmin, upload.array("images", 6), createProduct);
router.put("/:id", requireAdmin, upload.array("images", 6), updateProduct);
router.delete("/:id/images/:publicId", requireAdmin, removeProductImage);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
import { Router } from "express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/auth";
import {
  createOrder, createCustomOrder, getOrderByToken, getOrders, updateOrderStatus, deleteOrder,
} from "../controllers/order.controller";

const router = Router();

router.post("/", createOrder);
router.post("/custom", upload.single("image"), createCustomOrder);
router.get("/token/:token", getOrderByToken);

router.get("/", requireAdmin, getOrders);
router.patch("/:id/status", requireAdmin, updateOrderStatus);
router.delete("/:id", requireAdmin, deleteOrder);

export default router;
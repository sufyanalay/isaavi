import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import Counter from "../models/Counter";
import Settings from "../models/Settings";
import PromoCode, { IPromoCode } from "../models/PromoCode";
import { promoDiscountAmount, promoProblem } from "./promo.controller";
import { AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/upload";

async function nextOrderNumber() {
  const counter = await Counter.findByIdAndUpdate(
    "orderNumber",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ISV-${counter.seq}`;
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { items, customer, packaging, promoCode } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Cart is empty" });
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city)
      return res.status(400).json({ message: "Please fill in all details" });

    const settings = (await Settings.findOne()) || (await Settings.create({}));

    let subtotal = 0;
    const orderItems: any[] = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const qty = Math.max(1, Number(item.qty) || 1);
      subtotal += product.price * qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty,
        color: item.color,
        leatherType: item.leatherType,
        note: item.note,
      });
    }
    if (!orderItems.length) return res.status(400).json({ message: "No valid products found" });

    /* promo code yahan dobara verify hota hai — client ke discount par bharosa nahi karte */
    const wantedCode = String(promoCode || "").trim().toUpperCase();
    let appliedPromo: IPromoCode | null = null;
    let discountAmount = 0;

    if (wantedCode) {
      appliedPromo = await PromoCode.findOne({ code: wantedCode });
      if (!appliedPromo) return res.status(400).json({ message: "This promo code is not valid" });

      const problem = promoProblem(appliedPromo, subtotal);
      if (problem) return res.status(400).json({ message: problem });

      discountAmount = promoDiscountAmount(appliedPromo, subtotal);
    }

    const giftBagFee = packaging === "gift" ? settings.giftBagFee : 0;
    const deliveryFee = settings.deliveryFee;
    const total = Math.max(0, subtotal + giftBagFee + deliveryFee - discountAmount);
    const orderNumber = await nextOrderNumber();

    const order = await Order.create({
      orderNumber,
      type: "cart",
      items: orderItems,
      customer,
      packaging: packaging === "gift" ? "gift" : "normal",
      subtotal,
      giftBagFee,
      deliveryFee,
      promoCode: appliedPromo?.code || "",
      discountAmount,
      finalTotal: total,
      total,
      status: "Pending",
    });

    /* used count sirf successful order ke baad barhta hai */
    if (appliedPromo) {
      await PromoCode.findByIdAndUpdate(appliedPromo._id, { $inc: { usedCount: 1 } });
    }

    res.status(201).json({ orderNumber: order.orderNumber, token: order.token, discountAmount, total });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function createCustomOrder(req: AuthRequest, res: Response) {
  try {
    const { name, phone, itemType, color, leatherType, description } = req.body;
    if (!name || !phone || !description) return res.status(400).json({ message: "Please fill in all details" });

    let referenceImage = "";
    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      const uploaded = await uploadToCloudinary(file.buffer, "custom-orders");
      referenceImage = uploaded.url;
    }

    const orderNumber = await nextOrderNumber();
    const order = await Order.create({
      orderNumber,
      type: "custom",
      items: [],
      customer: { name, phone, address: "-", city: "-", country: "Pakistan" },
      subtotal: 0,
      giftBagFee: 0,
      deliveryFee: 0,
      total: 0,
      customDetails: { itemType, color, leatherType, description, referenceImage },
      status: "Awaiting Quote",
    });

    res.status(201).json({ orderNumber: order.orderNumber, token: order.token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getOrderByToken(req: AuthRequest, res: Response) {
  const order = await Order.findOne({ token: req.params.token });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}

export async function getOrders(req: AuthRequest, res: Response) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
}
export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}
export async function deleteOrder(req: AuthRequest, res: Response) {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted successfully" });
}
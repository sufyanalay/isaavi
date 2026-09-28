import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import Counter from "../models/Counter";
import Settings from "../models/Settings";
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
    const { items, customer, packaging } = req.body;
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

    const giftBagFee = packaging === "gift" ? settings.giftBagFee : 0;
    const deliveryFee = settings.deliveryFee;
    const total = subtotal + giftBagFee + deliveryFee;
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
      total,
      status: "Pending",
    });

    res.status(201).json({ orderNumber: order.orderNumber, token: order.token });
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
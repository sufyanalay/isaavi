import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  qty: number;
  color?: string;
  leatherType?: string;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  token: string;
  type: "cart" | "custom";
  items: IOrderItem[];
  customer: { name: string; phone: string; address: string; city: string; country: string; notes?: string };
  packaging: "normal" | "gift";
  subtotal: number;
  giftBagFee: number;
  deliveryFee: number;
  promoCode?: string;
  discountAmount: number;
  finalTotal: number;
  total: number;
  customDetails?: { itemType: string; color: string; leatherType: string; description: string; referenceImage?: string };
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "Awaiting Quote";
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    token: { type: String, required: true, unique: true, default: () => crypto.randomBytes(16).toString("hex") },
    type: { type: String, enum: ["cart", "custom"], default: "cart" },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
        color: String,
        leatherType: String,
        note: String,
      },
    ],
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Pakistan" },
      notes: String,
    },
    packaging: { type: String, enum: ["normal", "gift"], default: "normal" },
    subtotal: { type: Number, default: 0 },
    giftBagFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    promoCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    customDetails: {
      itemType: String,
      color: String,
      leatherType: String,
      description: String,
      referenceImage: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Awaiting Quote"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);
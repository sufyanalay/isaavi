import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  announcement: string;
  heroImage: string;
  phone: string;
  email: string;
  address: string;
  deliveryFee: number;
  giftBagFee: number;
  colors: string[];
  leatherTypes: string[];
  customOrderTypes: string[];
  promoActive: boolean;
  promoText: string;
}

const settingsSchema = new Schema<ISettings>({
  announcement: { type: String, default: "COD · Open before payment" },
  heroImage: { type: String, default: "" },
  phone: { type: String, default: "+92 300 000 0000" },
  email: { type: String, default: "orders@isaavileather.com" },
  address: { type: String, default: "Sialkot, Punjab, Pakistan" },
  deliveryFee: { type: Number, default: 250 },
  giftBagFee: { type: Number, default: 8000 },
  colors: { type: [String], default: ["Chestnut Brown", "Dark Cocoa", "Classic Black", "Tan Honey", "Oxblood"] },
  leatherTypes: { type: [String], default: ["Standard Cowhide"] },
  customOrderTypes: { type: [String], default: ["Laptop Bag", "School Bag", "Jacket", "Other"] },
  promoActive: { type: Boolean, default: false },
  promoText: { type: String, default: "" },
});

export default mongoose.model<ISettings>("Settings", settingsSchema);
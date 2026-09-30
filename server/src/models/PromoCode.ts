import mongoose, { Schema, Document } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  expiresAt?: Date | null;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    /* hamesha uppercase mein save hota hai */
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 }, // 0 = koi minimum nahi
    maxDiscount: { type: Number, default: 0, min: 0 }, // sirf percent ke liye, 0 = no cap
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromoCode>("PromoCode", promoCodeSchema);

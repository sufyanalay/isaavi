import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  discountText: string;
  terms: string;
  isActive: boolean;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    /* short badge shown in the top bar ticker, e.g. "20% OFF" — never a promo code */
    discountText: { type: String, default: "", trim: true },
    terms: { type: String, default: "" },
    /* offers me image field nahi — sirf text */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>("Offer", offerSchema);

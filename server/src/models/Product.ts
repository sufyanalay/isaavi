import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  sections: ("him" | "her" | "gift")[];
  type: "wallet" | "belt" | "card" | "pouch" | "pack";
  price: number;
  comparePrice: number;
  images: { url: string; publicId: string }[];
  colors: string[];
  leatherTypes: string[];
  design: string;
  description: string;
  customizable: boolean;
  featured: boolean;
  inStock: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sections: [{ type: String, enum: ["him", "her", "gift"], required: true }],
    type: { type: String, enum: ["wallet", "belt", "card", "pouch", "pack"], required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0, min: 0 },
    images: [{ url: String, publicId: String }],
    colors: [{ type: String }],
    leatherTypes: [{ type: String }],
    design: { type: String, default: "As shown" },
    description: { type: String, default: "" },
    customizable: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 22914 },
});

export default mongoose.model("Counter", counterSchema);
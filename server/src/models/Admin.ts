import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  comparePassword(pw: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
});

adminSchema.methods.comparePassword = function (pw: string) {
  return bcrypt.compare(pw, this.passwordHash);
};

export default mongoose.model<IAdmin>("Admin", adminSchema);
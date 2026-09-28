import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log("Usage: npm run seed:admin -- your@email.com yourPassword");
    process.exit(1);
  }

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("Yeh admin pehle se maujood hai.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash });
  console.log("Admin ban gaya:", email);
  process.exit(0);
}

run();
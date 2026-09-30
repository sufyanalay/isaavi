import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import settingsRoutes from "./routes/settings.routes";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ message: "Isaavi API running" }));app.get("/api/health", (_req, res) => res.json({ ok: true }));

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI as string);
  isConnected = true;
  console.log("MongoDB connected");
}

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ message: "DB connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

// Sirf local pe listen karo
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on :${port}`));
}

export default app;
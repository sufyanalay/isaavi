import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import settingsRoutes from "./routes/settings.routes";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Reuse the same MongoDB connection across warm serverless invocations
let dbConnected = false;
async function connectDB() {
  if (dbConnected) return;
  await mongoose.connect(process.env.MONGO_URI as string);
  dbConnected = true;
  console.log("MongoDB connected");
}
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    next(err);
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const orderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderLimiter, orderRoutes);
app.use("/api/settings", settingsRoutes);

// Local development only — Vercel calls the exported app directly, no listen() needed
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(port, () => console.log(`API running on :${port}`)))
    .catch((err) => {
      console.error("DB connection failed:", err.message);
      process.exit(1);
    });
}

export default app;
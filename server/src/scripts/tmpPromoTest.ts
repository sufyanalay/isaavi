import "dotenv/config";
import mongoose from "mongoose";
import PromoCode from "../models/PromoCode";
import Order from "../models/Order";
import Product from "../models/Product";

/* One-off test: promo validate ke saare cases + order creation with promo.
   Aakhir mein test order aur test promo delete kar deta hai. */

const API = "http://localhost:5000/api";
const CODE = "TESTOFF10";

async function post(url: string, body: any) {
  const r = await fetch(API + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json() };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const product = await Product.findOne();
  if (!product) throw new Error("No product in DB");

  await PromoCode.deleteMany({ code: CODE });
  const promo = await PromoCode.create({
    code: CODE,
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 500,
    minOrderAmount: 2000,
    usageLimit: 2,
  });

  console.log("1) valid        :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 2500 })));
  console.log("2) min order    :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 1500 })));
  console.log("3) cap applied  :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 20000 })));

  await PromoCode.updateOne({ _id: promo._id }, { isActive: false });
  console.log("4) inactive     :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 2500 })));

  await PromoCode.updateOne({ _id: promo._id }, { isActive: true, expiresAt: new Date(Date.now() - 86400000) });
  console.log("5) expired      :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 2500 })));

  await PromoCode.updateOne({ _id: promo._id }, { expiresAt: null, usedCount: 2 });
  console.log("6) limit hit    :", JSON.stringify(await post("/promos/validate", { code: CODE, cartTotal: 2500 })));

  await PromoCode.updateOne({ _id: promo._id }, { usedCount: 0 });

  const customer = { name: "Promo Test", phone: "03001234567", address: "Test street", city: "Sialkot" };
  console.log(
    "7) bad code order:",
    JSON.stringify(await post("/orders", { items: [{ productId: product._id, qty: 1 }], customer, promoCode: "NOPE123" }))
  );

  const order = await post("/orders", {
    items: [{ productId: product._id, qty: 2 }],
    customer,
    packaging: "normal",
    promoCode: CODE,
  });
  console.log("8) order created :", JSON.stringify(order.body));

  if (order.body?.token) {
    const saved = await (await fetch(`${API}/orders/token/${order.body.token}`)).json();
    console.log("   order totals  :", JSON.stringify({
      subtotal: saved.subtotal,
      deliveryFee: saved.deliveryFee,
      promoCode: saved.promoCode,
      discountAmount: saved.discountAmount,
      finalTotal: saved.finalTotal,
      total: saved.total,
    }));
    await Order.findByIdAndDelete(saved._id);
  }

  const after = await PromoCode.findById(promo._id);
  console.log("9) usedCount     :", after?.usedCount);

  await PromoCode.deleteMany({ code: CODE });
  const left = await Order.countDocuments({ "customer.name": "Promo Test" });
  await Order.deleteMany({ "customer.name": "Promo Test" });
  console.log("cleanup: test orders left =", left, "→ deleted");
  process.exit(0);
}

main();

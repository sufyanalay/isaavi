import { Response } from "express";
import PromoCode, { IPromoCode } from "../models/PromoCode";
import { AuthRequest } from "../middleware/auth";

/* ------------------------------------------------------------------
   Promo ke saare rules EK jagah — cart par "Apply" karte waqt aur
   order create karte waqt bilkul same checks chalti hain, taake
   client ke bheje hue discount par bharosa na karna pare.
   ------------------------------------------------------------------ */
export function promoProblem(promo: IPromoCode, cartTotal: number): string | null {
  if (!promo.isActive) return "This promo code is no longer active";
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now())
    return "This promo code has expired";
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit)
    return "This promo code has reached its usage limit";
  if (promo.minOrderAmount > 0 && cartTotal < promo.minOrderAmount)
    return `Minimum order for this code is Rs. ${promo.minOrderAmount.toLocaleString()} — add Rs. ${(
      promo.minOrderAmount - cartTotal
    ).toLocaleString()} more`;
  return null;
}

export function promoDiscountAmount(promo: IPromoCode, cartTotal: number): number {
  const raw =
    promo.discountType === "percent"
      ? (cartTotal * promo.discountValue) / 100
      : promo.discountValue;
  const capped = promo.maxDiscount > 0 ? Math.min(raw, promo.maxDiscount) : raw;
  return Math.max(0, Math.min(Math.round(capped), cartTotal));
}

export async function validatePromo(req: AuthRequest, res: Response) {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const cartTotal = Math.max(0, Number(req.body?.cartTotal) || 0);
    if (!code) return res.status(400).json({ message: "Please enter a promo code" });

    const promo = await PromoCode.findOne({ code });
    if (!promo) return res.status(400).json({ message: "This promo code is not valid" });

    const problem = promoProblem(promo, cartTotal);
    if (problem) return res.status(400).json({ message: problem });

    const discountAmount = promoDiscountAmount(promo, cartTotal);
    res.json({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      cartTotal,
      finalTotal: Math.max(0, cartTotal - discountAmount),
      message: `Code applied — you save Rs. ${discountAmount.toLocaleString()}`,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

function promoFields(body: any) {
  return {
    code: String(body.code || "").trim().toUpperCase(),
    discountType: body.discountType === "fixed" ? ("fixed" as const) : ("percent" as const),
    discountValue: Number(body.discountValue) || 0,
    minOrderAmount: Number(body.minOrderAmount) || 0,
    maxDiscount: Number(body.maxDiscount) || 0,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    usageLimit: Number(body.usageLimit) || 0,
    isActive: !(body.isActive === "false" || body.isActive === false),
  };
}

function promoFieldError(fields: ReturnType<typeof promoFields>): string | null {
  if (!fields.code) return "Promo code is required";
  if (fields.discountType === "percent" && (fields.discountValue <= 0 || fields.discountValue > 100))
    return "Percent discount must be between 1 and 100";
  if (fields.discountType === "fixed" && fields.discountValue <= 0)
    return "Fixed discount must be greater than 0";
  if (fields.expiresAt && Number.isNaN(fields.expiresAt.getTime())) return "Expiry date is not valid";
  return null;
}

export async function getPromos(_req: AuthRequest, res: Response) {
  const promos = await PromoCode.find().sort({ createdAt: -1 });
  res.json(promos);
}

export async function createPromo(req: AuthRequest, res: Response) {
  try {
    const fields = promoFields(req.body);
    const invalid = promoFieldError(fields);
    if (invalid) return res.status(400).json({ message: invalid });

    const clash = await PromoCode.findOne({ code: fields.code });
    if (clash) return res.status(400).json({ message: "This code already exists" });

    const promo = await PromoCode.create(fields);
    res.status(201).json(promo);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updatePromo(req: AuthRequest, res: Response) {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: "Promo code not found" });

    /* sirf bheji gayi fields badlein, baqi current value rakhein */
    const merged = {
      code: req.body.code !== undefined ? req.body.code : promo.code,
      discountType: req.body.discountType !== undefined ? req.body.discountType : promo.discountType,
      discountValue: req.body.discountValue !== undefined ? req.body.discountValue : promo.discountValue,
      minOrderAmount: req.body.minOrderAmount !== undefined ? req.body.minOrderAmount : promo.minOrderAmount,
      maxDiscount: req.body.maxDiscount !== undefined ? req.body.maxDiscount : promo.maxDiscount,
      expiresAt: req.body.expiresAt !== undefined ? req.body.expiresAt : promo.expiresAt,
      usageLimit: req.body.usageLimit !== undefined ? req.body.usageLimit : promo.usageLimit,
      isActive: req.body.isActive !== undefined ? req.body.isActive : promo.isActive,
    };

    const fields = promoFields(merged);
    const invalid = promoFieldError(fields);
    if (invalid) return res.status(400).json({ message: invalid });

    const clash = await PromoCode.findOne({ code: fields.code, _id: { $ne: promo._id } });
    if (clash) return res.status(400).json({ message: "This code already exists" });

    Object.assign(promo, fields);
    await promo.save();
    res.json(promo);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function deletePromo(req: AuthRequest, res: Response) {
  await PromoCode.findByIdAndDelete(req.params.id);
  res.json({ message: "Promo code deleted" });
}

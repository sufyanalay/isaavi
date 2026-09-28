import { Response } from "express";
import Settings from "../models/Settings";
import { AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/upload";

export async function getSettings(req: AuthRequest, res: Response) {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
}

export async function updateSettings(req: AuthRequest, res: Response) {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  const {
    announcement,
    phone,
    email,
    address,
    deliveryFee,
    giftBagFee,
    colors,
    leatherTypes,
    customOrderTypes,
    promoActive,
    promoText,
  } = req.body;

  if (announcement !== undefined) settings.announcement = announcement;
  if (phone !== undefined) settings.phone = phone;
  if (email !== undefined) settings.email = email;
  if (address !== undefined) settings.address = address;
  if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);
  if (giftBagFee !== undefined) settings.giftBagFee = Number(giftBagFee);
  if (colors) settings.colors = JSON.parse(colors);
  if (leatherTypes) settings.leatherTypes = JSON.parse(leatherTypes);
  if (customOrderTypes) settings.customOrderTypes = JSON.parse(customOrderTypes);
  if (promoActive !== undefined) settings.promoActive = promoActive === "true" || promoActive === true;
  if (promoText !== undefined) settings.promoText = promoText;

  const file = req.file as Express.Multer.File | undefined;
  if (file) {
    const uploaded = await uploadToCloudinary(file.buffer, "settings");
    settings.heroImage = uploaded.url;
  }

  await settings.save();
  res.json(settings);
}
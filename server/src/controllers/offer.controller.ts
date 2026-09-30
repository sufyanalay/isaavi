import { Response } from "express";
import Offer from "../models/Offer";
import { AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/upload";
import cloudinary from "../config/cloudinary";

/* Public — sirf active offers */
export async function getActiveOffers(_req: AuthRequest, res: Response) {
  const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(offers);
}

/* Admin — inactive offers bhi */
export async function getAllOffers(_req: AuthRequest, res: Response) {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.json(offers);
}

function offerFields(body: any) {
  return {
    title: String(body.title || "").trim(),
    description: body.description || "",
    discountText: String(body.discountText || "").trim(),
    terms: body.terms || "",
    isActive: !(body.isActive === "false" || body.isActive === false),
  };
}

export async function createOffer(req: AuthRequest, res: Response) {
  try {
    const fields = offerFields(req.body);
    if (!fields.title) return res.status(400).json({ message: "Offer title is required" });

    const file = req.file as Express.Multer.File | undefined;
    const image = file ? await uploadToCloudinary(file.buffer, "offers") : undefined;

    const offer = await Offer.create(image ? { ...fields, image } : fields);
    res.status(201).json(offer);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateOffer(req: AuthRequest, res: Response) {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const fields = offerFields({ ...offer.toObject(), ...req.body });
    if (!fields.title) return res.status(400).json({ message: "Offer title is required" });
    Object.assign(offer, fields);

    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      if (offer.image?.publicId) await cloudinary.uploader.destroy(offer.image.publicId);
      offer.image = await uploadToCloudinary(file.buffer, "offers");
    }

    await offer.save();
    res.json(offer);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: "Offer not found" });

  if (offer.image?.publicId) await cloudinary.uploader.destroy(offer.image.publicId);
  await offer.deleteOne();
  res.json({ message: "Offer deleted" });
}

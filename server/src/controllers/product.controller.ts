import { Response } from "express";
import Product from "../models/Product";
import { uploadToCloudinary } from "../middleware/upload";
import { AuthRequest } from "../middleware/auth";
import cloudinary from "../config/cloudinary";

export async function getProducts(req: AuthRequest, res: Response) {
  const { section, type } = req.query;
  const filter: any = {};
  if (section) filter.sections = section;
  if (type) filter.type = type;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
}

export async function getProductBySlug(req: AuthRequest, res: Response) {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const images = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer, "products")));

    const { name, price, comparePrice, sections, type, colors, leatherTypes, design, description } = req.body;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const product = await Product.create({
      name,
      slug,
      price: Number(price),
      comparePrice: Number(comparePrice) || 0,
      sections: JSON.parse(sections),
      type,
      colors: colors ? JSON.parse(colors) : [],
      leatherTypes: leatherTypes ? JSON.parse(leatherTypes) : [],
      design,
      description,
      images,
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      const newImages = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer, "products")));
      product.images.push(...newImages);
    }

    const { name, price, comparePrice, sections, type, colors, leatherTypes, design, description, inStock, featured } = req.body;
    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice) || 0;
    if (sections) product.sections = JSON.parse(sections);
    if (type) product.type = type;
    if (colors) product.colors = JSON.parse(colors);
    if (leatherTypes) product.leatherTypes = JSON.parse(leatherTypes);
    if (design) product.design = design;
    if (description !== undefined) product.description = description;
    if (inStock !== undefined) product.inStock = inStock === "true";
    if (featured !== undefined) product.featured = featured === "true";

    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function removeProductImage(req: AuthRequest, res: Response) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const img = product.images.find((i) => i.publicId === req.params.publicId);
  if (img) await cloudinary.uploader.destroy(img.publicId);

  product.images = product.images.filter((i) => i.publicId !== req.params.publicId);
  await product.save();
  res.json(product);
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await Promise.all(product.images.map((img) => cloudinary.uploader.destroy(img.publicId)));
  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
}
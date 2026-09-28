import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const validEmail = email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ id: "admin" }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.json({ token, email });
}
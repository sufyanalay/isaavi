import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  adminId?: string;
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ message: "Login required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.adminId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please login again" });
  }
}
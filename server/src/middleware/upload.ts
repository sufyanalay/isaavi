import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";

// Image RAM mein pakdta hai, disk par save nahi karta
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Sirf image files allowed hain"));
  },
});

export function uploadToCloudinary(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `isavess/${folder}`, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
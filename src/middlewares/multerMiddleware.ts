import multer from "multer";
import upload from "./multer"; // Upewnij się, że ścieżka jest poprawna
import { Request, Response, NextFunction } from "express";

export default function multerMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
      }
    } else if (req.fileValidationError) {
      console.error("File validation error:", req.fileValidationError);
      return res.status(400).json({ error: req.fileValidationError });
    } else if (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: "An unexpected error occurred." });
    }
    next();
  });
}
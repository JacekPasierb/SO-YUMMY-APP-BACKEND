import multer from "multer";
import path from "path";
import { NextFunction, Request, Response } from "express";

const storage = multer.diskStorage({});

const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".jpeg" && ext !== ".jpg" && ext !== ".png") {
    req.fileValidationError =
      "Invalid file type. Only JPEG, JPG, and PNG are allowed.";
    return cb(null, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit rozmiaru pliku: 10MB
  },
  fileFilter,
});

export const multerErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }
  next(err);
};

export default upload;

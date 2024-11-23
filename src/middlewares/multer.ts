import multer from "multer";
import path from "path";
import { NextFunction, Request, Response } from "express";



const storage = multer.diskStorage({});

const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("tu");
  
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

export default upload;
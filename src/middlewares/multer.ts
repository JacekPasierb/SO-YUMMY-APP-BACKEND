import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({});

const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".jpeg" && ext !== ".jpg" && ext !== ".png") {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit rozmiaru pliku: 10MB
  },
  fileFilter,
});

export default upload;

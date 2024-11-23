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

export default (req: Request, res: Response, next: NextFunction) => {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
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
};
import { Request, Response } from "express";
import cloudinary from "../../middlewares/cloudinary";

const saveImages = async (req: Request, res: Response): Promise<void> => {
  if (!req.file || !req.file.path) {
    res.status(400).json({ error: "Brak przesłanego pliku" });
    return;
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json(result);
  } catch (error) {
    console.error("Błąd podczas przetwarzania pliku:", error);
    res
      .status(500)
      .json({ error: "Wystąpił błąd podczas przetwarzania pliku" });
  }
};

export default saveImages;

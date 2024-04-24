const cloudinary = require("../../middlewares/cloudinary");

const saveImages = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(404).json({ error: "Brak przesłanego pliku" });
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
module.exports = saveImages;

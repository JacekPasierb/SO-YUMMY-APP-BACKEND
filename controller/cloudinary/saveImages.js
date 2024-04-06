const cloudinary = require("cloudinary").v2;


const saveImages = async (req, res) => {
 
  if (!req.file) {
    return res.status(400).json({ error: "Brak przesłanego pliku" });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json(result);
  } catch (error) {
    console.error("Błąd podczas przetwarzania pliku:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas przetwarzania pliku" });
  }
};
module.exports = saveImages;

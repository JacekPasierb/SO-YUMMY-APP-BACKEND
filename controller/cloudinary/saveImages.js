const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
  if (!req.file.path) {
   return  res.json("pusty");
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

const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
  // const result = await cloudinary.uploader.upload(req.file.path.data);
  if (!req) {
    return res.status(400).json({ error: "Brak przesłanego pliku" });
  }
  const result = req.file.path
  res.json(result);
};
module.exports = saveImages;

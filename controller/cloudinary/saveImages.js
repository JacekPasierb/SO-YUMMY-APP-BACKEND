const { cloudinary_js_config } = require("../../middlewares/cloudinary");


const saveImages = async (req, res) => {
 
  if (!req) {
    return res.status(400).json({ error: "Brak przesłanego pliku" });
  }
  const result = await cloudinary_js_config.uploader.upload(req.file.path);
  // const result = req.file.path
  res.json(result);
};
module.exports = saveImages;

const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
  // const result = await cloudinary.uploader.upload(req.file.path);
  const result = "pol"
  res.json(result);
};
module.exports = saveImages;

const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
    console.log("cloud");
  const result = await cloudinary.uploader.upload(req.file.path);
  res.json(result);
};
module.exports = saveImages;
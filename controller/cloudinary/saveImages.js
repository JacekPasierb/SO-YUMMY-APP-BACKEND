const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
    
  // const result = await cloudinary.uploader.upload(req.file.path);
  // res.json(result);
  const sizeInBytes = req;

  res.json({
    status: "success",
    code: 200,
    message: "Recipe pictttddd",
    
  });
};
module.exports = saveImages;
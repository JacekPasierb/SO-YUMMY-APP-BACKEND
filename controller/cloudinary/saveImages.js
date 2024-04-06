const cloudinary = require("cloudinary").v2;

const saveImages = async (req, res) => {
    
  // const result = await cloudinary.uploader.upload(req.file.path);
  // res.json(result);
  const sum = req.file
  res.json({
    status: "success",
    code: 200,
    message: "Recipe pic",
    sum:sum,
  });
};
module.exports = saveImages;
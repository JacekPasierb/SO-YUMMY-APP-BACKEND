const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

console.log("CLOUDINARY_NAME:", CLOUDINARY_NAME);
console.log("CLOUDINARY_KEY:", CLOUDINARY_KEY);
console.log("CLOUDINARY_SECRET:", CLOUDINARY_SECRET);
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
});
require("dotenv").config();

module.exports = cloudinary;
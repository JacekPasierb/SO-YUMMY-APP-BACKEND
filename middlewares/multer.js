const multer = require("multer");
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit rozmiaru pliku: 10MB
  },
  fileFilter: (req, file, cb) => {
    
    const ext = path.extname(file.originalname);

    if (ext !== ".jpeg" && ext !== ".jpg" && ext !== ".png") {
      cb(new Error("file is not sapported"), false);
    }
    cb(null, true);
  },
});

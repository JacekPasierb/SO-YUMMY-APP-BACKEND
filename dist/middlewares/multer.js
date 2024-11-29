"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerErrorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({});
const fileFilter = (req, file, cb) => {
    console.log("File filter called");
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ext !== ".jpeg" && ext !== ".jpg" && ext !== ".png") {
        req.fileValidationError =
            "Invalid file type. Only JPEG, JPG, and PNG are allowed.";
        return cb(null, false);
    }
    console.log("File type is valid");
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limit rozmiaru pliku: 10MB
    },
    fileFilter,
});
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .json({ error: "File too large. Maximum size is 10MB." });
        }
    }
    next(err);
};
exports.multerErrorHandler = multerErrorHandler;
exports.default = upload;

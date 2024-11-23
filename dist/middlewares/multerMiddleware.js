"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = multerMiddleware;
const multer_1 = __importDefault(require("multer"));
const multer_2 = __importDefault(require("./multer")); // Upewnij się, że ścieżka jest poprawna
function multerMiddleware(req, res, next) {
    multer_2.default.single("avatar")(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            console.error("Multer error:", err);
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
            }
        }
        else if (req.fileValidationError) {
            console.error("File validation error:", req.fileValidationError);
            return res.status(400).json({ error: req.fileValidationError });
        }
        else if (err) {
            console.error("Unexpected error:", err);
            return res.status(500).json({ error: "An unexpected error occurred." });
        }
        next();
    });
}

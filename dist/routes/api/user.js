"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../../controller/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateBody_1 = __importDefault(require("../../middlewares/validateBody"));
const user_2 = require("../../schemas/user");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const router = express_1.default.Router();
router.post("/register", (0, validateBody_1.default)(user_2.registerSchema), user_1.register);
router.get("/verify/:verificationToken", user_1.verifyEmail);
router.post("/signin", (0, validateBody_1.default)(user_2.signinSchema), user_1.signin);
router.post("/resend-verification-email", user_1.resendVerificationEmail);
router.get("/current", auth_1.default, user_1.currentUser);
router.patch("/logout", auth_1.default, user_1.logout);
router.patch("/update", auth_1.default, (0, validateBody_1.default)(user_2.updateUserSchema), multer_1.default.single("file"), user_1.update);
router.patch("/toogleTheme", auth_1.default, (0, validateBody_1.default)(user_2.toogleThemeSchema), user_1.toogleTheme);
exports.default = router;

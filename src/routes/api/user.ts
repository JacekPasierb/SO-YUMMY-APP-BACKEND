import express from "express";
import {
  register,
  verifyEmail,
  signin,
  currentUser,
  logout,
  update,
  resendVerificationEmail,
  toogleTheme,
} from "../../controller/user";
import auth from "../../middlewares/auth";
import validateBody from "../../middlewares/validateBody";
import {
  registerSchema,
  updateUserSchema,
  signinSchema,
  toogleThemeSchema,
} from "../../schemas/user";
import upload from "../../middlewares/multer";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/signin", validateBody(signinSchema), signin);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/current", auth, currentUser);
router.patch("/logout", auth, logout);
router.patch(
  "/update",
  auth,
  validateBody(updateUserSchema),
  upload.single("file"),
  update
);
router.patch(
  "/toogleTheme",
  auth,
  validateBody(toogleThemeSchema),
  toogleTheme
);

export default router;

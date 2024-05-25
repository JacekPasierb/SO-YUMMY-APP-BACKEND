const express = require("express");

const router = express.Router();
const {
  register,
  verifyEmail,
  signin,
  currentUser,
  logout,

  update,
  resendVerificationEmail,
} = require("../../controller/userController");
const auth = require("../../middlewares/auth");
const validateBody = require("../../middlewares/validateBody");
const {
  registerSchema,
  updateUserSchema,
  signinSchema,
} = require("../../schemas/userSchema");

router.post("/register", validateBody(registerSchema), register);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/signin", validateBody(signinSchema), signin);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/current", auth, currentUser);
router.patch("/logout", auth, logout);
router.patch("/update", auth, validateBody(updateUserSchema), update);

module.exports = router;

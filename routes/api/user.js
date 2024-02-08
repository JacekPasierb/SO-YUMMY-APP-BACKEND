const express = require("express");

const router = express.Router();
const {
  register,
  verifyEmail,
  signin,
  currentUser,
  logout,

  update,
} = require("../../controller/userController");
const auth = require("../../middlewares/auth");
const validateBody = require("../../middlewares/validateBody");
const { registerSchema, updateUserSchema, signinSchema } = require("../../schemas/userSchema");

router.post("/register", validateBody(registerSchema), register);
router.patch("/verify/:verificationToken", verifyEmail);
router.post("/signin", validateBody(signinSchema), signin);
router.get("/current", auth, currentUser);
router.patch("/logout", auth, logout);
router.patch("/update", auth, validateBody(updateUserSchema), update);

module.exports = router;

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

router.post("/register", register);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/signin", signin);
router.get("/current", auth, currentUser);
router.get("/logout", auth, logout);
router.put("/update", auth, update);

module.exports = router;

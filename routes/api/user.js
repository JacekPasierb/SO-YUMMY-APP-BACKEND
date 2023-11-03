const express = require("express");

const router = express.Router();
const { register, verifyEmail } = require("../../controller/userController");

router.post("/register", register);
router.get("/verify/:verificationToken", verifyEmail);

module.exports = router;

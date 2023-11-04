const express = require("express");

const router = express.Router();
const { register, verifyEmail, signin } = require("../../controller/userController");

router.post("/register", register);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/signin", signin)

module.exports = router;

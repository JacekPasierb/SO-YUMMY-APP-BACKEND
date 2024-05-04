const express = require("express");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/", auth, getPopularRecipe);

module.exports = router;

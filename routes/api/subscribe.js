const express = require("express");
const auth = require("../../middlewares/auth");
const validateBody = require("../../middlewares/validateBody");
const subscribeUserSchema = require("../../schemas/subscribeUserSchema");
const addSubscribe = require("../../controller/subscribeController");

const router = express.Router();

router.post("/", auth, validateBody(subscribeUserSchema), addSubscribe);

module.exports = router;

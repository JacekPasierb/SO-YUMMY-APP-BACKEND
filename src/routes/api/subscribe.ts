import express from "express";
import auth from "../../middlewares/auth";
import validateBody from "../../middlewares/validateBody";
import subscribeUserSchema from "../../schemas/subscribeUser";
import addSubscribe from "../../controller/subscribe";

const router = express.Router();

router.post("/", auth, validateBody(subscribeUserSchema), addSubscribe);

export default router; 
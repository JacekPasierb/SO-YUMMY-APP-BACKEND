"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const shoppingList_1 = require("../../controller/shoppingList");
const router = express_1.default.Router();
router.get("/", auth_1.default, shoppingList_1.getShoppingList);
router.post("/add", auth_1.default, shoppingList_1.addIngredient);
router.delete("/remove", auth_1.default, shoppingList_1.deleteIngredient);
exports.default = router;

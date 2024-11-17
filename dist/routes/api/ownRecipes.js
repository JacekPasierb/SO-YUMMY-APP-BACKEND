"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateBody_1 = __importDefault(require("../../middlewares/validateBody"));
const recipe_1 = __importDefault(require("../../schemas/recipe"));
const ownRecipe_1 = require("../../controller/ownRecipe");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const saveImages_1 = __importDefault(require("../../controller/cloudinary/saveImages"));
const router = express_1.default.Router();
router.get("/:userId", auth_1.default, ownRecipe_1.getOwnRecipes);
router.post("/add", auth_1.default, (0, validateBody_1.default)(recipe_1.default), ownRecipe_1.addOwnRecipe);
router.delete("/remove/:recipeId", auth_1.default, ownRecipe_1.deleteOwnRecipe);
router.post("/picture", auth_1.default, multer_1.default.single("file"), saveImages_1.default);
exports.default = router;

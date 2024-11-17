"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateBody_1 = __importDefault(require("../../middlewares/validateBody"));
const subscribeUser_1 = __importDefault(require("../../schemas/subscribeUser"));
const subscribe_1 = __importDefault(require("../../controller/subscribe"));
const router = express_1.default.Router();
router.post("/", auth_1.default, (0, validateBody_1.default)(subscribeUser_1.default), subscribe_1.default);
exports.default = router;

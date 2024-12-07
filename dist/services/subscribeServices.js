"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscribe = exports.findSubscribe = void 0;
const subscribe_1 = __importDefault(require("../models/subscribe"));
const findSubscribe = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield subscribe_1.default.findOne(query);
    }
    catch (error) {
        console.error("Error fetching subscription:", error);
        return null;
    }
});
exports.findSubscribe = findSubscribe;
const createSubscribe = (_a) => __awaiter(void 0, [_a], void 0, function* ({ body, owner, }) {
    try {
        return yield subscribe_1.default.create(Object.assign(Object.assign({}, body), { owner }));
    }
    catch (error) {
        console.error("Error creating subscription:", error);
        return null;
    }
});
exports.createSubscribe = createSubscribe;

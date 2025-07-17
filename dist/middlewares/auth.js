"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const auth = (req, res, next) => {
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    const authorization = req.headers.authorization;
    passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
        if (err || !user || user.token !== (authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1])) {
            return next((0, handleErrors_1.default)(401));
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.default = auth;

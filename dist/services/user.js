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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.findUser = exports.addUser = exports.getUserByEmail = void 0;
const user_1 = require("../models/user");
const getUserByEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, }) {
    try {
        return yield user_1.User.findOne({ email });
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.getUserByEmail = getUserByEmail;
const getUserById = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_1.User.findById(_id);
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.getUserById = getUserById;
const addUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password, name, verificationToken, token, }) {
    try {
        return yield user_1.User.create({
            email,
            password,
            name,
            verificationToken,
            token,
        });
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.addUser = addUser;
const findUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_1.User.findOne(query);
    }
    catch (error) {
        console.error(error);
        return null;
    }
});
exports.findUser = findUser;
const updateUser = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_1.User.findByIdAndUpdate(id, body, { new: true });
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.updateUser = updateUser;

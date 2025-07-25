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
exports.toogleTheme = exports.resendVerificationEmail = exports.update = exports.logout = exports.currentUser = exports.signin = exports.verifyEmail = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const nanoid_1 = require("nanoid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../services/user");
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const emailService_1 = require("../utils/emailService");
dotenv_1.default.config();
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const checkEmail = yield (0, user_1.findUser)({ email });
        if (checkEmail) {
            return next((0, handleErrors_1.default)(409, "Email is already in use"));
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 12);
        const newUser = yield (0, user_1.addUser)({
            email,
            password: hashPassword,
            name,
            verificationToken: (0, nanoid_1.nanoid)(),
            token: null,
        });
        if (!newUser) {
            throw (0, handleErrors_1.default)(500, "Failed to create user");
        }
        if (!newUser.verificationToken) {
            throw (0, handleErrors_1.default)(500, "Verification token generation failed");
        }
        // Verify manual
        const verificationToken = newUser.verificationToken;
        const userDemo = yield (0, user_1.findUser)({ verificationToken });
        if (!userDemo) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const update = yield (0, user_1.updateUser)(userDemo._id, {
            verify: true,
            verificationToken: null,
        });
        // -----------------
        // Hide function sendMail
        // const emailToSend = {
        //   to: newUser.email,
        //   verificationToken: newUser.verificationToken,
        // };
        // sendVerificationEmail(emailToSend);
        res.status(201).json({
            status: "Created",
            code: 201,
            message: "Register Success !",
            data: {
                token: newUser.token,
                user: {
                    email: newUser.email,
                    name: newUser.name,
                },
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        if (req.fileValidationError) {
            res.status(400).json({ error: req.fileValidationError });
            return;
        }
        const updatedUser = yield (0, user_1.updateUser)(userId, req.body);
        if (!updatedUser) {
            res.status(500).json({ message: "Failed to update user" });
            return;
        }
        const { name, avatar } = updatedUser;
        res.status(200).json({
            status: "User data updated successfully",
            code: 200,
            data: {
                user: {
                    name,
                    avatar,
                },
            },
        });
        return;
    }
    catch (error) {
        // if (
        //   error instanceof multer.MulterError &&
        //   error.code === "LIMIT_FILE_SIZE"
        // ) {
        //   res.status(400).json({ error: "File too large. Maximum size is 10MB." });
        //   return;
        // }
        next(error);
    }
});
exports.update = update;
const toogleTheme = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.user;
        const { isDarkTheme } = req.body;
        const updatedUser = yield (0, user_1.updateUser)(_id, { isDarkTheme });
        if (!updatedUser) {
            throw (0, handleErrors_1.default)(500, "Failed to update user");
        }
        res.status(200).json({
            status: "User data updated successfully",
            code: 200,
            data: {
                isDarkTheme: updatedUser.isDarkTheme,
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.toogleTheme = toogleTheme;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verificationToken } = req.params;
        const user = yield (0, user_1.findUser)({ verificationToken });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const update = yield (0, user_1.updateUser)(user._id, {
            verify: true,
            verificationToken: null,
        });
        if (!update) {
            res.status(500).json({ message: "Failed to update user" });
            return;
        }
        res.redirect(`https://so-yummy-jack.netlify.app/signin?verified=true`);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.verifyEmail = verifyEmail;
const signin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield (0, user_1.findUser)({ email });
        if (!user) {
            throw (0, handleErrors_1.default)(401, "Invalid Email or Password");
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            throw (0, handleErrors_1.default)(401, "Invalid Email or Password");
        }
        // OFF function verify email - sendGrid is to pay
        // if (!user.verify) {
        //   throw handleError(403, "email is not verifed");
        // }
        const payload = {
            id: user._id,
            email: user.email,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.SECRET, {
            expiresIn: "1h",
        });
        yield (0, user_1.updateUser)(user._id, { token });
        res.status(200).json({
            status: "OK",
            code: 200,
            data: {
                token,
                user: {
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    userId: user._id,
                    isDarkTheme: user.isDarkTheme,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.signin = signin;
const resendVerificationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield (0, user_1.findUser)({ email });
        if (!user) {
            throw (0, handleErrors_1.default)(404, "User not found");
        }
        if (user.verify) {
            throw (0, handleErrors_1.default)(400, "Email is already verified");
        }
        if (!user.verificationToken) {
            throw (0, handleErrors_1.default)(500, "Verification token generation failed");
        }
        const emailToSend = {
            to: user.email,
            verificationToken: user.verificationToken,
        };
        yield (0, emailService_1.sendVerificationEmail)(emailToSend);
        res.status(200).json({
            status: "OK",
            message: "Verification email sent!",
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const currentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield (0, user_1.getUserById)(userId);
        if (!user) {
            throw (0, handleErrors_1.default)(404, "User not found");
        }
        const { email, name, id, token, avatar, isDarkTheme } = user;
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                userId: id,
                email,
                name,
                token,
                avatar,
                isDarkTheme,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.currentUser = currentUser;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.user;
        const clearToken = yield (0, user_1.updateUser)(_id, { token: null });
        if (!clearToken) {
            throw (0, handleErrors_1.default)(404, "Failed to logout: User not found or update unsuccessful");
        }
        res.status(204).json();
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;

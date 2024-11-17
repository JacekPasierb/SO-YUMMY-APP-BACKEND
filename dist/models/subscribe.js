"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const emailRegexp = /^\S+@\S+\.\S+$/;
const subscribeSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    email: {
        type: String,
        match: emailRegexp,
        required: [true, "Email is required"],
        unique: true,
    },
}, { versionKey: false });
const Subscribe = (0, mongoose_1.model)("subscribe", subscribeSchema);
exports.default = Subscribe;

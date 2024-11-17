"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const connectionString = process.env.SO_YUMMY;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const connection = mongoose_1.default.connect(connectionString, {
    dbName: "so_yummy",
});
connection
    .then(() => {
    console.log("Database connection successful");
    app_1.default.listen(PORT, () => {
        console.log(`App listens on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("Error while establishing connection:", err);
    process.exit(1);
});

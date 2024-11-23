"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const morgan_1 = __importDefault(require("morgan"));
const user_1 = __importDefault(require("./routes/api/user"));
const subscribe_1 = __importDefault(require("./routes/api/subscribe"));
const recipe_1 = __importDefault(require("./routes/api/recipe"));
const ingredients_1 = __importDefault(require("./routes/api/ingredients"));
const ownRecipes_1 = __importDefault(require("./routes/api/ownRecipes"));
const favoriteRecipes_1 = __importDefault(require("./routes/api/favoriteRecipes"));
const popularRecipe_1 = __importDefault(require("./routes/api/popularRecipe"));
const shoppingList_1 = __importDefault(require("./routes/api/shoppingList"));
dotenv_1.default.config();
require("./config/passport-config");
const app = (0, express_1.default)();
const swaggerDocument = require("../swagger.json");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
const swaggerJsdoc = require("swagger-jsdoc");
app.use((0, morgan_1.default)(formatsLogger));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express_1.default.static("public"));
const allowedOrigins = [
    "https://so-yummy-jack.netlify.app",
    "http://localhost:3000",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
}));
// Obsługa preflight requests
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.sendStatus(204); // No Content
});
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, { customCssUrl: CSS_URL }));
app.use("/api/users", user_1.default);
app.use("/api/subscribe", subscribe_1.default);
app.use("/api/recipes", recipe_1.default);
app.use("/api/ingredients", ingredients_1.default);
app.use("/api/ownRecipes", ownRecipes_1.default);
app.use("/api/favorite", favoriteRecipes_1.default);
app.use("/api/popularRecipes", popularRecipe_1.default);
app.use("/api/shopping-list", shoppingList_1.default);
app.get("/", (req, res) => {
    res.json({ version: "1.0" });
});
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ error: message });
});
exports.default = app;

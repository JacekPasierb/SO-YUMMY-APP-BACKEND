"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
app.use(express_1.default.static("public"));
const allowedOrigins = ["https://so-yummy-jack.netlify.app"];
// app.use((req, res, next) => {
//   console.log('CORS request from:', req.headers.origin);
//   next();
// });
// app.use(cors({
//   origin: allowedOrigins,
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
// }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
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
    res.status(500).json({ error: error.message });
});
exports.default = app;

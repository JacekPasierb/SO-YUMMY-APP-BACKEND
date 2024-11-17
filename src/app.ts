import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import logger from "morgan";
import userRouter from "./routes/api/user";
import subscribeRouter from "./routes/api/subscribe";
import recipeRouter from "./routes/api/recipe";
import ingredientsRouter from "./routes/api/ingredients";
import ownRecipesRouter from "./routes/api/ownRecipes";
import favoriteRouter from "./routes/api/favoriteRecipes";
import popularRecipesRouter from "./routes/api/popularRecipe";
import shoppingListRouter from "./routes/api/shoppingList";
import handleError from "./utils/handleErrors";

dotenv.config();
require("./config/passport-config");

const app = express();
const swaggerDocument = require("../swagger.json");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const swaggerJsdoc = require("swagger-jsdoc");

app.use(logger(formatsLogger));
app.use(express.json());
const allowedOrigins = ["https://so-yummy-jack.netlify.app"];

app.use(cors({
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));

app.use(express.static("public"));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS, PATCH"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL })
);
app.use("/api/users", userRouter);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/ingredients", ingredientsRouter);
app.use("/api/ownRecipes", ownRecipesRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/popularRecipes", popularRecipesRouter);
app.use("/api/shopping-list", shoppingListRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ version: "1.0" });
});
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: error.message });
});

export default app;

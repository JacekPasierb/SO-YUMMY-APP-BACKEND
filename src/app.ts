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
import { multerErrorHandler } from "./middlewares/multer";

dotenv.config();
require("./config/passport-config");

const app = express();
const swaggerDocument = require("../swagger.json");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const swaggerJsdoc = require("swagger-jsdoc");

app.use(logger(formatsLogger));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(express.static("public"));
const allowedOrigins = [
  "https://so-yummy-jack.netlify.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🚀 Uwierzytelnione żądania CORS (np. tokeny JWT)
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);



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

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  multerErrorHandler(err, req, res, next);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;

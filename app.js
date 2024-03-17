const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/passport-config");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const swaggerDocument = require("./swagger.json");
const logger = require("morgan");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const userRouter = require("./routes/api/user");
const subscribeRouter = require("./routes/api/subscribe.js");
const recipeRouter = require("./routes/api/recipe.js");
const ingredientsRouter = require("./routes/api/ingredients.js");
const ownRecipesRouter = require("./routes/api/ownRecipes.js");

const handleError = require("./utils/handleErrors");
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

app.get("/", (req, res) => res.json({ version: "1.0" }));

app.use((error, req, res, next) => {
  if (handleError) {
    return res.status(error.status).json({ message: error.message });
  }

  res.status(500).json({ message: `Internal server error: ${error.message}` });
});

module.exports = app;

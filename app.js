const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/passport-config");

const app = express();

const logger = require("morgan");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

const userRouter = require("./routes/api/user");
const { handle404, handle500 } = require("./utils/handleErrors");

app.use("/api/users", userRouter);
app.get("/", (req, res) => res.json({ version: "1.0" }));

app.use((req, res) => {
  handle404(res, "Not Found");
});
app.use((err, req, res, next) => {
  console.log("err:", err);
  handle500(res, err.message);
});

module.exports = app;

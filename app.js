const express = require("express");
const cors = require("cors");
const app = express();

const logger = require("morgan");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

const userRouter = require('./routes/api/user');

app.use("/api/users", userRouter);

app.use((req, res) => {
   return res.status(404).json({
     status: "Not Found",
     code: "404",
     message: `${message}`,
     data,
   });
});
app.use((err, req, res, next) => {
  console.log("err:", err);
 return res.status(500).json({
   message: message,
 });
});

module.exports = app;
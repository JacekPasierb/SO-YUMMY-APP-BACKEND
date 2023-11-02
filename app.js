const express = require("express");
const cors = require("cors");
const app = express();

const logger = require("morgan");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);

app.use((req, res) => {
  handle404(res, "Not Found");
});
app.use((err, req, res, next) => {
  console.log("err:", err);
  handle500(res, err.message);
});

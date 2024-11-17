import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const connectionString = process.env.SO_YUMMY as string;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const connection = mongoose.connect(connectionString, {
  dbName: "so_yummy",
});

connection
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`App listens on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Error while establishing connection:", err);
    process.exit(1);
  });
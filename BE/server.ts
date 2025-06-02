import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./src/db";
dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    console.log("mongoDB connected");
    app.listen(PORT, (err) => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Server error", err);
  });

import dotenv from "dotenv";
import app from ".";
import { connectDB } from "./db";
dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    console.log("mongoDB connected");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Server error", err);
  });

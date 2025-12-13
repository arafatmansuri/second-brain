import dotenv from "dotenv";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import app from ".";
import { connectDB } from "./db";
dotenv.config();

const PORT = process.env.PORT || 3001;
const numCPUs = availableParallelism();
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  connectDB()
    .then(() => {
      console.log("mongoDB connected");
      console.log("Redis connected");
      app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.log("Server error", err);
    });
}

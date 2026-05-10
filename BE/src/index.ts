import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { globalErrorHandler } from "./lib/ErrorHandler";
import v1Router from "./routes/v1Routes";
import v2Router from "./routes/v2Routes";
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://second-brain-alpha.vercel.app",
  "https://second-brain-backend-g2fo.onrender.com",
  "https://www.secondbrain.services",
  "https://secondbrain.services",
];
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(<string>origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  }),
);
app.use(cookieParser());
app.use(express.static("./public"));
// app.use(rateLimiterMiddleware(apiLimiter, userKeyGenerator));
app.get("/", async (req, res) => {
  res.json({ message: "Server is healthy", pid: process.pid });
  return;
});

app.use("/api/v1/", v1Router);
app.use("/api/v2/", v2Router);

app.use(globalErrorHandler);

export default app;

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import {
  apiLimiter,
  rateLimiterMiddleware,
  userKeyGenerator,
} from "./middlewares/rateLimiter.middleware";
import contentRouter from "./routes/content.route";
import userRouter from "./routes/user.route";
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://second-brain-alpha.vercel.app",
  "https://second-brain-backend-g2fo.onrender.com",
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
  })
);
app.use(cookieParser());
app.use(express.static("./public"));
app.use(rateLimiterMiddleware(apiLimiter, userKeyGenerator));
app.get("/", async (req, res) => {
  res.json({ message: "Working" });
  return;
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

export default app;

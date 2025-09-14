import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import contentRouter from "./src/routes/content.route";
import userRouter from "./src/routes/user.route";
import { apiLimiter, rateLimiterMiddleware, userKeyGenerator } from "./src/middlewares/rateLimiter.middleware";
const app = express();
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
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
app.use(rateLimiterMiddleware(apiLimiter,userKeyGenerator))
app.get("/check", async (req, res) => {
  res.json({ message: "Working" });
  return;
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

export default app;

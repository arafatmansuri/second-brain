import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import userRouter from "./src/routes/user.route";
import contentRouter from "./src/routes/content.route";
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/check", (req, res) => {
  res.json({ message: "Working" });
  return;
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

export default app;

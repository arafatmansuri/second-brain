import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/check", (req, res) => {
  res.json({ message: "Working" });
  return;
});

export default app;

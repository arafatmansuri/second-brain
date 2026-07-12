import { Router } from "express";
import contentRouter from "./v1/content.route";
import userRouter from "./v1/user.route";

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/content", contentRouter);

export default v1Router;
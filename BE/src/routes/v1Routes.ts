import { Router } from "express";
import userRouter from "./user.route";
import contentRouter from "./content.route";

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/content", contentRouter);

export default v1Router;
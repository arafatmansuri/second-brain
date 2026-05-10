import { Router } from "express";
import userRouter from "./user.route";
import contentRouter from "./content.route";

const v2Router = Router();

v2Router.use("/users", userRouter);
v2Router.use("/contents", contentRouter);
v2Router.use("/projects", contentRouter);

export default v2Router;
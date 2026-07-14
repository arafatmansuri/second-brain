import { Router } from "express";
import contentRouter from "./v2/content.route";
import userRouter from "./v2/user.route";
import projectRouter from "./v2/project.route";

const v2Router = Router();

v2Router.use("/users", userRouter);
v2Router.use("/contents", contentRouter);
v2Router.use("/projects", projectRouter);

export default v2Router;

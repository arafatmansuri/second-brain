import { Router } from "express";
import { signup } from "../controllers/user.controller";

const userRouter: Router = Router();

userRouter.route("/signup").post(signup);

export default userRouter;

import { Router } from "express";
import { getUser, signin, signup } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/user.middleware";

const userRouter: Router = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/signin").post(signin);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);

export default userRouter;

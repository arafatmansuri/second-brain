import { Router } from "express";
import {
  getUser,
  refreshTokens,
  signin,
  signout,
  signup,
} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/user.middleware";

const userRouter: Router = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/signin").post(signin);
userRouter.route("/refreshtokens").post(refreshTokens);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);
userRouter.route("/signout").get(signout);

export default userRouter;

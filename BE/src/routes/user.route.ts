import { Router } from "express";
import {
  getUser,
  googleSignin,
  refreshTokens,
  signin,
  signout,
  signup,
} from "../controllers/user.controller";
import {
  loginLimiter,
  rateLimiterMiddleware,
  signupLimiter,
} from "../middlewares/rateLimiter.middleware";
import { verifyJWT } from "../middlewares/user.middleware";
const userRouter: Router = Router();

userRouter.route("/signup").post(rateLimiterMiddleware(signupLimiter), signup);
userRouter.route("/signin").post(rateLimiterMiddleware(loginLimiter), signin);
userRouter.route("/auth/google").get(googleSignin);
userRouter.route("/refreshtokens").post(refreshTokens);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);
userRouter.route("/signout").get(signout);

export default userRouter;

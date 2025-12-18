import { Router } from "express";
import {
  forgetOTPVerification,
  forgetWithOTP,
  getUser,
  googleSignin,
  refreshTokens,
  signin,
  signout,
  signup,
  signupOTPVerification,
  signupWithOTP,
} from "../controllers/user.controller";
import {
  loginLimiter,
  rateLimiterMiddleware,
  signupLimiter,
} from "../middlewares/rateLimiter.middleware";
import { verifyJWT } from "../middlewares/user.middleware";
const userRouter: Router = Router();

userRouter.route("/signup").post(rateLimiterMiddleware(signupLimiter), signup);
// userRouter.route("/signupotp").post(signupWithOTP);
// userRouter.route("/signupverify").post(signupOTPVerification);
userRouter
  .route("/signupotp")
  .post(rateLimiterMiddleware(signupLimiter), signupWithOTP);
userRouter
  .route("/signupverify")
  .post(rateLimiterMiddleware(signupLimiter), signupOTPVerification);
userRouter.route("/signin").post(rateLimiterMiddleware(loginLimiter), signin);
userRouter.route("/auth/google").get(googleSignin);
userRouter.route("/refreshtokens").post(refreshTokens);
userRouter.route("/forgetotp").post(forgetWithOTP);
userRouter.route("/forgetverify").post(forgetOTPVerification);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);
userRouter.route("/signout").post(signout);

export default userRouter;

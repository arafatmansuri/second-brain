import { Router } from "express";
import {
  forgetOTPVerification,
  forgetWithOTP,
  getUser,
  googleSignin,
  refreshTokens,
  resenedOTP,
  signin,
  signout,
  signup,
  signupOTPVerification,
  signupWithOTP,
} from "../controllers/user.controller";
import {
  forgetLimiter,
  forgetOTPLimiter,
  loginLimiter,
  rateLimiterMiddleware,
  resendOTPLimiter,
  signupLimiter,
  signupOTPLimiter,
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
  .post(rateLimiterMiddleware(signupOTPLimiter), signupOTPVerification);
userRouter.route("/signin").post(rateLimiterMiddleware(loginLimiter), signin);
userRouter.route("/auth/google").get(googleSignin);
userRouter.route("/refreshtokens").post(refreshTokens);
userRouter
  .route("/forgetotp")
  .post(rateLimiterMiddleware(forgetLimiter), forgetWithOTP);
userRouter
  .route("/forgetverify")
  .post(rateLimiterMiddleware(forgetOTPLimiter), forgetOTPVerification);
userRouter
  .route("/resendotp")
  .post(rateLimiterMiddleware(resendOTPLimiter), resenedOTP);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);
userRouter.route("/signout").post(signout);

export default userRouter;

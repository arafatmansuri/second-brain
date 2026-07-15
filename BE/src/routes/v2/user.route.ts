import { Router } from "express";
import {
  changePassword,
  deleteAccount,
  forgetOTPVerification,
  forgetWithOTP,
  getUser,
  googleAuthCallback,
  googleSignin,
  refreshTokens,
  resendOTP,
  signin,
  signout,
  signupOTPVerification,
  signupWithOTP,
  updateProfile,
} from "../../controllers/v2/user.controller";
import {
  forgetLimiter,
  forgetOTPLimiter,
  loginLimiter,
  rateLimiterMiddleware,
  resendOTPLimiter,
  signupLimiter,
  signupOTPLimiter,
} from "../../middlewares/v1/rateLimiter.middleware";
import { verifyJWT } from "../../middlewares/v1/user.middleware";
const userRouter: Router = Router();

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
userRouter.route("/auth/google/callback").get(googleAuthCallback);
userRouter.route("/refreshtokens").post(refreshTokens);
userRouter
  .route("/forgetotp")
  .post(rateLimiterMiddleware(forgetLimiter), forgetWithOTP);
userRouter
  .route("/forgetverify")
  .post(rateLimiterMiddleware(forgetOTPLimiter), forgetOTPVerification);
userRouter
  .route("/resendotp")
  .post(rateLimiterMiddleware(resendOTPLimiter), resendOTP);

//Secured Routes
userRouter.use(verifyJWT);
userRouter.route("/getuser").get(getUser);
userRouter.route("/updateprofile").put(updateProfile);
userRouter.route("/changepassword").put(changePassword);
userRouter.route("/deleteAccount").delete(deleteAccount);
userRouter.route("/signout").post(signout);

export default userRouter;

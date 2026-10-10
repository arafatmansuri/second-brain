import { Router } from "express";
import {
  changePassword,
  deleteAccount,
  disableTOTPMFA,
  emailMFASendOTP,
  emailMFAVerification,
  enableTOTPMFA,
  forgetOTPVerification,
  forgetWithOTP,
  getUser,
  googleAuthCallback,
  googleSignin,
  refreshTokens,
  resendOTP,
  signin,
  signinWithMFA,
  signout,
  signupOTPVerification,
  signupWithOTP,
  toggleEmailMFA,
  TOTPMfa,
  updateProfile,
  verifyTOTPMFA,
} from "../../controllers/v2/user.controller";
import {
  forgetLimiter,
  forgetOTPLimiter,
  loginLimiter,
  rateLimiterMiddleware,
  resendOTPLimiter,
  signupLimiter,
  signupOTPLimiter,
  MFALimiter,
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
userRouter.route("/signin/mfa").post(rateLimiterMiddleware(loginLimiter), signinWithMFA);
userRouter.route("/signin/mfa/totp").post(rateLimiterMiddleware(MFALimiter), TOTPMfa);
userRouter.route("/signin/mfa/email/send").post(rateLimiterMiddleware(MFALimiter), emailMFASendOTP);
userRouter.route("/signin/mfa/email/verify").post(rateLimiterMiddleware(MFALimiter), emailMFAVerification);
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
userRouter.route("/mfa/totp/setup").post(enableTOTPMFA);
userRouter.route("/mfa/totp/verify").post(verifyTOTPMFA);
userRouter.route("/mfa/totp/disable").post(rateLimiterMiddleware(MFALimiter), disableTOTPMFA);
userRouter.route("/mfa/email/toggle").post(toggleEmailMFA);

userRouter.route("/signout").post(signout);

export default userRouter;

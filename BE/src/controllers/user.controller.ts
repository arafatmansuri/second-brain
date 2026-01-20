import axios from "axios";
import bcrypt from "bcrypt";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { z } from "zod";
import { oAuth2Client } from "../config/OAuth2Client";
import Content from "../models/content.model";
import Embedding from "../models/embedding.model";
import Link from "../models/link.model";
import { OTP } from "../models/otp.model";
import User from "../models/user.model";
import { emailQueue } from "../queue/emailQueue";
import { Handler, StatusCode } from "../types";
import {
  canResendOTP,
  generateOTP,
  getOTPData,
  saveOTP,
  verifyOTP,
} from "../utils/otp.service";
import {
  forgetInputSchema,
  signupInputSchema,
} from "../validations/user.validation";

export const signupWithOTP: Handler = async (req, res): Promise<void> => {
  try {
    const userInput = signupInputSchema.safeParse(req.body);
    if (!userInput.success) {
      res.status(StatusCode.InputError).json({
        message: userInput.error.issues?.[0]?.message || "Signup data required",
      });
      return;
    }
    const { email, password, username } = userInput.data;
    const userExists = await User.findOne({ email, username });
    if (userExists) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "User already exists with this username or email" });
      return;
    }

    const otp = generateOTP();
    await saveOTP({
      email,
      otp,
      data: {
        password: await bcrypt.hash(password, 10),
        username: username,
        otpType: "registration",
        subject: "OTP for user signup",
      },
    });

    await emailQueue.add("send-otp", {
      email,
      otp,
      subject: "OTP for user signup",
      username,
    });
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 20 * 60 * 1000, // 20 minutes
    };
    res
      .cookie("otp_data", { email, type: "signup" }, cookieOptions)
      .status(StatusCode.Success)
      .json({ message: "OTP sent successfully" });
    return;
  } catch (err: any) {
    console.log(err);
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", err });
    return;
  }
};
export const signupOTPVerification: Handler = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.cookies.otp_data;

    if (!otp || !email) {
      return res
        .status(StatusCode.InputError)
        .json({ message: "Invalid Request" });
    }

    const otpData = await verifyOTP(email, otp, "registration");

    if (!otpData || otpData.otpType !== "registration") {
      return res
        .status(StatusCode.NotFound)
        .json({ message: "Invalid or Expired OTP" });
    }

    const user = await User.create({
      email,
      password: otpData.password as string,
      username: otpData.username as string,
    });

    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    await user.updateOne({ refreshToken });

    res
      .cookie("accessToken", accessToken, { httpOnly: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .json({ message: "Signup successful", user });
  } catch (err: any) {
    res.status(StatusCode.ServerError).json({
      message: err.message || "Something went wrong from our side",
      err,
    });
    return;
  }
};
export const resendOTP: Handler = async (req, res): Promise<void> => {
  try {
    const { email } = req.cookies.otp_data;
    if (!email) {
      res.status(StatusCode.InputError).json({ message: "Invalid Request" });
      return;
    }

    const canResend = await canResendOTP(email);
    if (!canResend) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "Wait 2 minutes before sending OTP" });
      return;
    }

    const otp = generateOTP();
    const otpData = await getOTPData(email);
    if (!otpData) {
      res.status(StatusCode.NotFound).json({ message: "Invalid OTP request" });
      return;
    }
    const { otpType, subject, username } = otpData;
    await saveOTP({
      email,
      otp,
      data: {
        password: await bcrypt.hash(otpData.password || "", 10),
        username: username,
        otpType: otpType,
        subject: subject,
      },
    });

    await emailQueue.add("send-otp", { email, otp, subject, username });
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 10 * 60000, // 10 minutes
    };
    res
      .cookie(
        "otp_data",
        {
          email: email,
          type: otpData.otpType === "registration" ? "signup" : "forget",
        },
        cookieOptions,
      )
      .status(StatusCode.Success)
      .json({ message: "OTP Reset Successfully" });
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", err });
    return;
  }
};
export const signin: Handler = async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (username === "") {
      res.status(StatusCode.InputError).json({
        message: "Username is required",
      });
      return;
    }
    const user = await User.findOne({
      username: username,
    });
    if (!user) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "User doesn't exist" });
      return;
    }
    if (password === "") {
      res.status(StatusCode.InputError).json({
        message: "Password is required",
      });
      return;
    }
    const isPasswordCorrect = user.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(StatusCode.InputError).json({ message: "Invalid password" });
      return;
    }
    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: <"none">"none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(StatusCode.Success)
      .json({ message: "signin successfull", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside" });
  }
};
export const googleSignin: Handler = async (req, res): Promise<void> => {
  try {
    const code = req.query.code;
    const googleResponse = await oAuth2Client.getToken(code as string);
    oAuth2Client.setCredentials(googleResponse.tokens);
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`,
    );

    let user = await User.findOne({ email: userRes.data.email });
    if (!user) {
      user = await User.create({
        username: userRes.data.name,
        email: userRes.data.email,
        method: "oauth",
      });
    }
    const { accessToken, refreshToken } =
      await user.generateAccessAndRefreshToken();
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: <"none">"none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    res
      .status(StatusCode.Success)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ message: "signin successfull", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const getUser: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -refreshToken");
    res
      .status(StatusCode.Success)
      .json({ message: "user data fetched success", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const refreshTokens: Handler = async (req, res): Promise<void> => {
  try {
    const IRefreshToken = req.cookies?.refreshToken;
    if (!IRefreshToken) {
      res
        .status(StatusCode.Unauthorized)
        .json({ message: "Refresh token is empty" });
      return;
    }
    const decodedToken = jwt.verify(
      IRefreshToken,
      <string>process.env.JWT_REFRESH_TOKEN_SECRET,
    );
    if (!decodedToken) {
      res.status(StatusCode.Unauthorized).json({ message: "Unauthorized" });
      return;
    }
    //@ts-ignore
    const user = await User.findById(decodedToken._id);
    if (!user) {
      res
        .status(StatusCode.Unauthorized)
        .json({ message: "Invalid refresh Token" });
      return;
    }
    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: <"none">"none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .status(StatusCode.Success)
      .json({ message: "Access token refreshed" });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.Unauthorized)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const forgetWithOTP: Handler = async (req, res): Promise<void> => {
  try {
    const userEmail = z.string().email({ message: "Invalid email address" });
    const userInput = userEmail.safeParse(req.body.email);
    if (!userInput.success) {
      res.status(StatusCode.InputError).json({
        message: userInput.error.errors[0].message || "Invalid email address",
      });
      return;
    }
    const email = userInput.data;
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "User not found with this email" });
      return;
    }
    if (user.method == "oauth") {
      res.status(StatusCode.DocumentExists).json({
        message: "User registered with OAuth do not require password reset",
      });
      return;
    }
    const isOTPExists = await OTP.findOne({ email, type: "forget" })
      .sort({ createdAt: -1 })
      .limit(1);
    if (isOTPExists) {
      const otpCreatedTime = new Date(isOTPExists.createdAt);
      if (new Date().getTime() - otpCreatedTime.getTime() <= 120000) {
        res
          .status(StatusCode.DocumentExists)
          .json({ message: "Wait for 2 minutes before sending new OTP" });
        return;
      }
    }
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const newOtp = await OTP.create({
      email,
      otp,
      subject: "OTP for forget password",
      username: user.username,
      type: "forget",
    });
    if (!newOtp) {
      res.status(500).json({ message: "OTP not generated" });
      return;
    }
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 10 * 60000, // 10 minutes
    };
    res
      .cookie(
        "otp_data",
        { email: newOtp.email, type: "forget" },
        cookieOptions,
      )
      .status(200)
      .json({ message: "OTP sent successfully" });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", err });
    return;
  }
};
export const forgetOTPVerification: Handler = async (
  req,
  res,
): Promise<void> => {
  try {
    const parsedInput = forgetInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      res.status(StatusCode.NotFound).json({
        message:
          parsedInput.error.issues[0].message || "OTP/Password is required",
      });
      return;
    }
    const { otp, password } = parsedInput.data;
    const { email } = req.cookies.otp_data;
    const IsOtpExists = await OTP.find({ email: email, type: "forget" })
      .sort({ createdAt: -1 })
      .limit(1);
    if (IsOtpExists.length === 0 || otp !== IsOtpExists[0]?.otp) {
      res.status(StatusCode.NotFound).json({
        message: "Invalid OTP",
      });
      return;
    }
    await OTP.deleteMany({ email, type: "forget" });
    await User.updateOne(
      { email },
      {
        $set: {
          password: bcrypt.hashSync(password, 10),
        },
      },
    );
    // const cookieOptions: CookieOptions = {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // };
    res
      .status(StatusCode.Success)
      // .cookie("accessToken", accessToken, cookieOptions)
      // .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "password changed successfully",
        // user,
      });
    return;
  } catch (err: any) {
    res.status(StatusCode.ServerError).json({
      message: err.message || "Something went wrong from our side",
      err,
    });
    return;
  }
};
export const OTPVerification = async (
  req: Request,
  res: Response,
  type: "signup" | "forget",
): Promise<void> => {
  try {
    const parsedOTP = Number(req.body.otp);
    if (!parsedOTP) {
      res.status(StatusCode.NotFound).json({ message: "OTP not found" });
      return;
    }
    const { email } = req.cookies.otp_data;
    const IsOtpExists = await OTP.find({ email: email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (IsOtpExists.length === 0 || parsedOTP !== IsOtpExists[0]?.otp) {
      res.status(StatusCode.NotFound).json({
        message: "Invalid OTP",
      });
      return;
    }
    let user;
    if (type == "signup") {
      const newUser = await User.create({
        username: IsOtpExists[0].username,
        email,
        password: IsOtpExists[0].password,
        method: "normal",
      });
      user = await User.findById(newUser._id).select("-password -refreshToken");
      if (!user) {
        res
          .status(StatusCode.ServerError)
          .json({ message: "Something went wrong from our side." });
        return;
      }
    }
    const { accessToken, refreshToken } = user
      ? user.generateAccessAndRefreshToken()
      : { accessToken: "", refreshToken: "" };

    await OTP.deleteMany({ email });
    await User.updateOne(
      { email },
      {
        $set: {
          refreshToken,
        },
      },
    );
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    res
      .status(StatusCode.Success)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "User signup successfull",
        user: user,
      });
    return;
  } catch (err: any) {
    res.status(StatusCode.ServerError).json({
      message: err.message || "Something went wrong from our side",
      err,
    });
    return;
  }
};
export const signout: Handler = async (req, res): Promise<void> => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: <"none">"none",
      path: "/",
      maxAge: 0, // 1 day
    };
    res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(StatusCode.Success)
      .json({ message: "user signout success" });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const updateProfile: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const username = z
      .string()
      .min(3, { message: "Username must be atleast 3 characters" })
      .safeParse(req.body.username);
    if (!username.success) {
      res.status(StatusCode.InputError).json({
        message: username.error.errors[0].message || "Username is required",
      });
      return;
    }
    try {
      await User.updateOne(
        { _id: userId },
        { $set: { username: username.data } },
      );
      const updatedUser = await User.findById(userId).select(
        "-password -refreshToken",
      );
      res
        .status(StatusCode.Success)
        .json({ message: "Profile updated successfully", user: updatedUser });
      return;
    } catch (error) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "Username already taken" });
      return;
    }
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", error: err });
    return;
  }
};
const changePasswordInputSchema = z.object({
  oldPassword: z.string({ required_error: "Old password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "New Password length shouldn't be less than 8" })
    .regex(/[A-Z]/, {
      message: "New Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "New Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "New Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "New Pasword should include atlist 1 special character",
    }),
});
export const changePassword: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const parsedPasswords = changePasswordInputSchema.safeParse(req.body);
    if (!parsedPasswords.success) {
      res.status(StatusCode.InputError).json({
        message:
          parsedPasswords.error.errors[0].message || "Username is required",
      });
      return;
    }
    const { oldPassword, newPassword } = parsedPasswords.data;
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCode.NotFound).json({ message: "User not found" });
      return;
    }
    const isOldPasswordCorrect = user.comparePassword(oldPassword);
    if (!isOldPasswordCorrect) {
      res
        .status(StatusCode.InputError)
        .json({ message: "Old password is incorrect" });
      return;
    }
    await User.updateOne(
      { _id: userId },
      { $set: { password: bcrypt.hashSync(newPassword, 10) } },
    );
    const updatedUser = await User.findById(userId).select(
      "-password -refreshToken",
    );
    res
      .status(StatusCode.Success)
      .json({ message: "Profile updated successfully", user: updatedUser });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", error: err });
    return;
  }
};
export const deleteAccount: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(StatusCode.NotFound).json({ message: "User not found" });
      return;
    }
    await Content.deleteMany({ userId });
    await Link.deleteMany({ userId });
    await Embedding.deleteMany({ userId });
    res
      .status(StatusCode.Success)
      .json({ message: "Account deleted successfully" });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside", error: err });
    return;
  }
};

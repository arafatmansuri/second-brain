import axios from "axios";
import bcrypt from "bcrypt";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { oAuth2Client } from "../config/OAuth2Client";
import Content from "../models/content.model";
import Embedding from "../models/embedding.model";
import Link from "../models/link.model";
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
  changePasswordInputSchema,
  forgetInputSchema,
  OTPVerificationInputSchema,
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
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
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
        otpType: "signup",
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

    const otpData = await verifyOTP(email, otp, "signup");

    if (!otpData || otpData.otpType !== "signup") {
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
        password: otpData.password || "",
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
          type: otpData.otpType,
        },
        cookieOptions,
      )
      .status(StatusCode.Success)
      .json({ message: "OTP resent successfully" });
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
        message: userInput.error?.issues[0]?.message || "Invalid email address",
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
    const otp = generateOTP();
    await saveOTP({
      email,
      otp,
      data: {
        otpType: "forgot",
        subject: "OTP for password reset",
        username: user.username,
      },
    });

    await emailQueue.add("send-otp", {
      email,
      otp,
      username: user.username,
      subject: "OTP for password reset",
    });
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 10 * 60000, // 10 minutes
    };
    res
      .cookie("otp_data", { email: email, type: "forget" }, cookieOptions)
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
          parsedInput.error?.issues[0]?.message || "OTP/Password is required",
      });
      return;
    }
    const { otp, password } = parsedInput.data;
    const { email } = req.cookies.otp_data;
    const otpData = await verifyOTP(email, otp, "forgot");

    if (!otpData || otpData.otpType !== "forgot") {
      res.status(StatusCode.NotFound).json({ message: "Invalid OTP" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
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
): Promise<void> => {
  try {
    const parsedInput = OTPVerificationInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      res.status(StatusCode.NotFound).json({
        message:
          parsedInput.error?.issues[0]?.message || "OTP/Password is required",
      });
      return;
    }
    const { otp, password } = parsedInput.data;
    const { email, type } = req.cookies.otp_data;

    if (!email) {
      res.status(StatusCode.InputError).json({ message: "Invalid Request" });
      return;
    }

    const otpData = await verifyOTP(email, otp.toString(), type);

    if (!otpData || otpData.otpType !== type) {
      res
        .status(StatusCode.NotFound)
        .json({ message: "Invalid or Expired OTP" });
      return;
    }
    if (type == "signup") {
      let user = await User.create({
        email,
        password: otpData.password as string,
        username: otpData.username as string,
      });

      const { accessToken, refreshToken } =
        user.generateAccessAndRefreshToken();
      await user.updateOne({ refreshToken });
      res
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json({ message: "Signup successful", user });
      return;
    } else if (type == "forgot") {
      if (!password) {
        res
          .status(StatusCode.InputError)
          .json({ message: "Password is required" });
        return;
      }
      await User.updateOne(
        { email },
        {
          $set: {
            password: bcrypt.hashSync(password, 10),
          },
        },
      );
      res.status(StatusCode.Success).json({
        message: "password changed successfully",
      });
      return;
    }
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

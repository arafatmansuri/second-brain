import axios from "axios";
import bcrypt from "bcrypt";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { z } from "zod";
import { oAuth2Client } from "../config/OAuth2Client";
import { OTP } from "../models/otp.model";
import User from "../models/user.model";
import { Handler, StatusCode } from "../types";
import Content from "../models/content.model";
import Link from "../models/link.model";
import Embedding from "../models/embedding.model";
const userInputSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters" }),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
const forgetInputSchema = z.object({
  otp: z.number(),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
const signupInputSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
export const signupWithOTP: Handler = async (req, res): Promise<void> => {
  try {
    const userInput = signupInputSchema.safeParse(req.body);
    if (!userInput.success) {
      res.status(StatusCode.InputError).json({
        message:
          userInput.error.errors[0].message || "Username/Password required",
      });
      return;
    }
    const { email, password, username } = userInput.data;
    const isUsernameAvailable = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (isUsernameAvailable) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "User already exists with this username or email" });
      return;
    }
    const isOTPExists = await OTP.findOne({ email, type: "signup" })
      .sort({ createdAt: -1 })
      .limit(1);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 20 * 60000, // 20 minutes
    };
    if (isOTPExists) {
      const otpCreatedTime = new Date(isOTPExists.createdAt);
      if (new Date().getTime() - otpCreatedTime.getTime() <= 120000) {
        await OTP.deleteMany({ email, type: "signup" });
        const newOtp = await OTP.create({
          email,
          otp: isOTPExists.otp,
          subject: "OTP for user signup",
          password: bcrypt.hashSync(password, 10),
          username,
          type: "signup",
        });
        res
          .cookie(
            "otp_data",
            { email: newOtp.email, type: "signup" },
            cookieOptions
          )
          .status(200)
          .json({ message: "OTP sent successfully" });
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
      subject: "OTP for user signup",
      password: bcrypt.hashSync(password, 10),
      username,
      type: "signup",
    });
    if (!newOtp) {
      res.status(500).json({ message: "OTP not generated" });
      return;
    }
    res
      .cookie(
        "otp_data",
        { email: newOtp.email, type: "signup" },
        cookieOptions
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
export const resenedOTP: Handler = async (req, res): Promise<void> => {
  try {
    const otpData = req.cookies.otp_data;
    if (!otpData || !otpData.email || !otpData.type) {
      res.status(StatusCode.InputError).json({
        message: "Invalid email address",
      });
      return;
    }
    const isUserExists = await User.isUserExists({ email: otpData.email });
    if (isUserExists) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "User already exists with this email" });
      return;
    }
    const isOTPExists = await OTP.findOne({
      email: otpData.email,
      type: otpData.type,
    })
      .sort({ createdAt: -1 })
      .limit(1);
    if (
      isOTPExists &&
      new Date().getTime() - new Date(isOTPExists.createdAt).getTime() <= 600000
    ) {
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
      email: otpData.email,
      otp,
      subject: `OTP for user ${otpData.type}`,
      password: isOTPExists?.password || "",
      username: isOTPExists?.username || "",
      type: otpData.type,
      createdAt: new Date(),
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
      maxAge: 20 * 60000, // 20 minutes
    };
    res
      .cookie(
        "otp_data",
        { email: newOtp.email, type: newOtp.type },
        cookieOptions
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
export const signupOTPVerification: Handler = async (
  req,
  res
): Promise<void> => {
  try {
    const parsedOTP = Number(req.body.otp);
    if (!parsedOTP) {
      res.status(StatusCode.NotFound).json({ message: "OTP not found" });
      return;
    }
    const { email } = req.cookies.otp_data;
    const IsOtpExists = await OTP.find({ email: email, type: "signup" })
      .sort({ createdAt: -1 })
      .limit(1);
    if (IsOtpExists.length === 0 || parsedOTP !== IsOtpExists[0]?.otp) {
      res.status(StatusCode.NotFound).json({
        message: "Invalid OTP",
      });
      return;
    }
    const newUser = await User.create({
      username: IsOtpExists[0].username,
      email,
      password: IsOtpExists[0].password,
      method: "normal",
    });
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      res
        .status(StatusCode.ServerError)
        .json({ message: "Something went wrong from our side." });
      return;
    }
    await OTP.deleteMany({ email, type: "signup" });
    const { accessToken, refreshToken } =
      createdUser.generateAccessAndRefreshToken();
    await createdUser.updateOne(
      { email },
      {
        $set: {
          refreshToken,
        },
      }
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
        user: createdUser,
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
export const signup: Handler = async (req, res): Promise<void> => {
  try {
    const isUsernameAvailable = await User.isUserExists({
      username: req.body.username,
    });
    if (isUsernameAvailable) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "username already taken" });
      return;
    }
    const userInput = userInputSchema.safeParse(req.body);
    if (!userInput.success) {
      res.status(StatusCode.InputError).json({
        message:
          userInput.error.errors[0].message || "Username/Password required",
      });
      return;
    }
    const user = await User.create({
      username: userInput.data.username,
      password: userInput.data.password,
      method: "normal",
    });
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
      .json({ message: "signup successfull", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from ourside" });
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
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
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
      <string>process.env.JWT_REFRESH_TOKEN_SECRET
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
        cookieOptions
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
  res
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
      }
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
  type: "signup" | "forget"
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
      }
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
        { $set: { username: username.data } }
      );
      const updatedUser = await User.findById(userId).select(
        "-password -refreshToken"
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
      { $set: { password: bcrypt.hashSync(newPassword, 10) } }
    );
    const updatedUser = await User.findById(userId).select(
      "-password -refreshToken"
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

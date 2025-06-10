import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/user.model";
import { Handler, IUser, IUserDocument, StatusCode } from "../types";
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
export const signup: Handler = async (req, res): Promise<void> => {
  try {
    const isUsernameAvailable = await User.isUserExists(req.body.username);
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
    const user: IUserDocument | IUser = await User.create({
      username: userInput.data.username,
      password: userInput.data.password,
    });
    res
      .status(StatusCode.Success)
      .json({ message: "signup successfull", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
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
    const user = await User.findOne<IUserDocument>({
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
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const getUser: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById<IUserDocument>(userId);
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
    const user = await User.findById<IUserDocument>(decodedToken._id);
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
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(StatusCode.Success)
      .json({ message: "Access token refreshed" });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.Unauthorized)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
export const signout: Handler = async (req, res): Promise<void> => {
  try {
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(StatusCode.Success)
      .json({ message: "user signout success" });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};

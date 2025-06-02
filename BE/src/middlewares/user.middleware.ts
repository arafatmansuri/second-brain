import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { StatusCode } from "../types";
export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken;
    const decodedToken = jwt.verify(
      accessToken,
      <string>process.env.JWT_ACCESS_TOKEN_SECRET
    );
    if (!decodedToken) {
      res.status(StatusCode.Unauthorized).json({ message: "Unautorized" });
      return;
    }
    const user = await User.findById(decodedToken._id);
    if (!user) {
      res.status(StatusCode.Unauthorized).json({ message: "Unauthorized" });
      return;
    }
    req.userId = user._id;
    next();
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from our side" });
    return;
  }
};

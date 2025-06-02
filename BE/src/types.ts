import { Request, Response } from "express";
import { Document, Model, Schema } from "mongoose";
// User Schema/Interface
export interface IUser {
  username: string;
  password: string;
  refreshToken?: string;
}
export interface IUserDocument extends Model<IUser> {
  comparePassword: (inputPassword: string) => boolean;
  generateAccessAndRefreshToken: () => {
    accessToken: string;
    refreshToken: string;
  };
  isUserExists: (username: string) => Promise<boolean>;
}

//Links Schema/Interface
interface ILink {
  hash: string;
  userId: Schema.Types.ObjectId;
}

export interface ILinkDocument extends ILink, Document {
  deocdeLink: () => string;
}
// Tags Schema/Interface
export interface ITags extends Document {
  title: string;
}
// Content Schema/Interface
export interface IContent {
  link: string;
  type: "image" | "video" | "article" | "audio";
  title: string;
  tags: Schema.Types.ObjectId[];
  userId: Schema.Types.ObjectId;
}

export type Handler = (req: Request, res: Response) => any;

export enum StatusCode {
  Success = 200,
  InputError = 411,
  DocumentExists = 403,
  ServerError = 500,
  NotFound = 404,
  Unauthorized = 401,
}

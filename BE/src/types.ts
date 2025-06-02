import { Document, Schema } from "mongoose";
// User Schema/Interface
interface IUser {
  username: string;
  password: string;
  refreshToken?: string;
}
export interface IUserDocument extends IUser, Document {
  comparePassword: (inputPassword: string) => boolean;
  generateAccessAndRefreshToken: () => {
    accessToken: string;
    refreshToken: string;
  };
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

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

export interface ITags extends Document {
  title: string;
}
export interface IContent extends Document {
  link: string;
  type: "image" | "video" | "article" | "audio";
  title: string;
  tags: Schema.Types.ObjectId[];
  userId: Schema.Types.ObjectId;
}

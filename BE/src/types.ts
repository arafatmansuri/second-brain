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

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import { IUserDocument } from "../types";
const userSchema: Schema<IUserDocument> = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function (inputPassword: string) {
  return bcrypt.compareSync(inputPassword, this.password);
};
userSchema.methods.generateAccessAndRefreshToken = function (): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    { _id: this._id, username: this.username },
    <string>process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { _id: this._id, username: this.username },
    <string>process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  this.refreshToken = refreshToken;
  return { accessToken, refreshToken };
};

const User: mongoose.Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema
);

export default User;

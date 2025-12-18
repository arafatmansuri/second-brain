import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import { IUserDocument } from "../types";
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    email: { type: String },
    shared: { type: Boolean, default: false },
    refreshToken: { type: String },
    method: { type: String, enum: ["oauth", "normal"] },
  },
  {
    methods: {
      comparePassword(inputPassword: string) {
        if (this.method == "oauth" || !this.password) {
          return;
        }
        return bcrypt.compareSync(inputPassword, this.password);
      },
      generateAccessAndRefreshToken() {
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
        this.save();
        return { accessToken, refreshToken };
      },
    },
    statics: {
      async isUserExists(username: string, email?: string) {
        const user = await this.findOne<IUserDocument>({ username, email });
        if (user) {
          return user;
        }
        return false;
      },
    },
  }
);
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password") || this.method == "oauth") {
//     next();
//   }
//   if (this.password) this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

const User = mongoose.model("User", userSchema);

export default User;

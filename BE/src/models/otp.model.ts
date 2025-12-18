import { model, Schema } from "mongoose";
import { sendMail } from "../utils/mailer";

const OTPSchema = new Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  otp: { type: Number, required: true },
  type: { type: String, enum: ["forget", "signup"] },
  createdAt: { type: Date, default: Date.now(), expires: 60 * 10 },
});

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendMail(this.email, this.subject, this.username, this.otp);
  }
  next();
});

export const OTP = model("OTP", OTPSchema);

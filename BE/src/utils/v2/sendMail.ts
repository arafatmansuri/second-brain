import { emailQueue } from "../../queue/emailQueue";
import { OTPData, saveOTP } from "../otp.service";

export const queueMail = async (email: string, data: OTPData, otp: number) => {
  await saveOTP({ email, otp: otp.toString(), data });
  await emailQueue.add("send-otp", { email, otp, username: data.username, subject: data.subject || "OTP Verification" });
};

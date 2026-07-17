import { OTPData, saveOTP } from "../otp.service";
import { sendMail } from "./mailgun";

export const queueMail = async (email: string, data: OTPData, otp: number) => {
  await saveOTP({ email, otp: otp.toString(), data });
  await sendMail({
    to: email,
    subject: data.subject || "Your OTP Code",
    user: data.username || "User",
    otp,
  });
};

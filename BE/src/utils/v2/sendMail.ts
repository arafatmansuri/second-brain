import { OTPData, saveOTP } from "../otp.service";
import { sendMail } from "./googleMailer";

export const sendMailV2 = async (email: string, data: OTPData, otp: number) => {
  await saveOTP({ email, otp: otp.toString(), data });
  await sendMail({
    to: email,
    subject: data.subject || "OTP Verification",
    user: data.username || "User",
    otp,
  });
};
export const queueMail = (email: string, data: OTPData, otp: number) => {
  setImmediate(() => sendMailV2(email, data, otp));
};

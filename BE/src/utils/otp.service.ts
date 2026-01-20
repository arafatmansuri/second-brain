import bcrypt from "bcrypt";
import redis from "../config/redisClient";

const OTP_TTL = 5 * 60; //5min
const RESEND_BLOCK_TIME = 0; //0min
// const RESEND_BLOCK_TIME = 120; //2min

//GENERATE OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export type OTPData = {
  otp?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  otpType?: "signup" | "forgot" | undefined;
  subject?: string | undefined;
};

//SAVE OTP IN REDIS
export const saveOTP = async ({
  email,
  otp,
  data,
}: {
  email: string;
  otp: string;
  data: OTPData;
}) => {
  const hashedOtp = await bcrypt.hash(otp, 10);

  const payload = {
    otp: hashedOtp,
    ...data,
  };

  await redis.set(`otp:${email}`, JSON.stringify(payload), "EX", OTP_TTL);
};

//GET OTPDATA FROM REDIS
export const getOTPData = async (email: string): Promise<OTPData | null> => {
  const data = await redis.get(`otp:${email}`);
  return data ? JSON.parse(data) : null;
};

//CHECK RESEND ELIGIBILITY
export const canResendOTP = async (email: string) => {
  const ttl = await redis.ttl(`otp:${email}`);
  return ttl <= OTP_TTL - RESEND_BLOCK_TIME;
};

//verifyOTP
export const verifyOTP = async (
  email: string,
  userOtp: string,
  otpType: "signup" | "forgot"
) => {
  const data = await getOTPData(email);
  if (!data || !data.otp) return null;

  const isValid = await bcrypt.compare(userOtp, data.otp as string);
  if (!isValid) return null;
  if (data.otpType !== otpType) return null;
  await redis.del(`otp:${email}`);
  return data;
};

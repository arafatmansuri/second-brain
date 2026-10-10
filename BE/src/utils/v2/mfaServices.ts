import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verify } from "otplib";
const MFA_ENC_KEY = Buffer.from(process.env.MFA_ENC_KEY || "", "hex");

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", MFA_ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc]
    .map((b) => b.toString("base64"))
    .join(":");
}

export function decrypt(payload: string): string {
  const [iv, tag, enc] = payload
    .split(":")
    .map((p) => Buffer.from(p, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", MFA_ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
    "utf8",
  );
}

export const hashCode = (c: string) =>
  crypto.createHash("sha256").update(c.trim().toLowerCase()).digest("hex");

export const generateBackupCodes = (n = 8) => {
  const plain = Array.from({ length: n }, () =>
    crypto.randomBytes(5).toString("hex"),
  );
  return { plain, hashed: plain.map(hashCode) };
};

type Purpose = "access" | "mfa_pending";

export const signToken = (
  userId: string,
  purpose: Purpose,
  expiresIn: string,
) =>
  jwt.sign({ sub: userId, purpose }, <string>process.env.JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);

export function readToken(token: string, purpose: Purpose): string | null {
  try {
    const p = jwt.verify(
      token,
      <string>process.env.JWT_SECRET,
    ) as jwt.JwtPayload;
    return p.purpose === purpose && typeof p.sub === "string" ? p.sub : null;
  } catch {
    return null;
  }
}

export async function verifyTotp(
  secret: string,
  lastStep: number | undefined,
  code: string | number,
): Promise<number | null> {
  if (!secret) return null;
  const token = String(code).trim();
  if (!/^\d{6}$/.test(token)) return null;

  let result;
  try {
    result = await verify({
      secret: decrypt(secret),
      token,
      epochTolerance: 30, // ±1 step (30s) of clock drift
      // afterTimeStep: lastStep, // rejects replay of used steps
    });
  } catch (err) {
    console.log("error in verifyTotp", err);
    return null;
  }
  if (!result.valid) return null;
  return result.delta ?? 0;
}

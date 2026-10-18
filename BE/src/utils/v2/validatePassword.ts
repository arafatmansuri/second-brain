import crypto from "crypto";

export async function isPwned(password: string): Promise<boolean> {
  const hash = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = hash.slice(0, 5),
    suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();
  const line = text.split("\n").find((l) => l.startsWith(suffix));
  return line ? true : false;
}


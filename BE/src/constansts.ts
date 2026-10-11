export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: <"none">"none",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};
export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: <"none">"none",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

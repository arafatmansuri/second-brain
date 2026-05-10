// src/lib/logger.ts
import pino from "pino";
// import { getEnv } from "../config/env.js";

export function getLogger() {
  // const env = getEnv();

  return pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    ...(process.env.NODE_ENV !== "production" && {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }),
    base: {
      env: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.body.password",
        "req.body.otp",
        "req.body.refreshToken",
      ],
      censor: "[REDACTED]",
    },
  });
}

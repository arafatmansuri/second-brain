// src/middleware/errorHandler.ts
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
// import { getEnv } from "../config/env.js";
import { AppError } from "./AppError.js";
import { getLogger } from "./logger.js";

// const env = getEnv();
const logger = getLogger();

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Mongoose duplicate key
  if ((err as any)?.code === 11000) {
    const field = Object.keys((err as any).keyPattern ?? {})[0] ?? "field";
    res.status(409).json({
      success: false,
      code: "CONFLICT",
      message: `${field} already exists`,
    });
    return;
  }

  // Operational errors
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, url: req.url }, "Non-operational error");
    }
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(process.env.NODE_ENV !== "production" && { meta: err.meta }),
    });
    return;
  }

  // Unknown errors — never expose internals
  logger.error({ err, url: req.url }, "Unhandled error");
  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Something went wrong from our side",
  });
}

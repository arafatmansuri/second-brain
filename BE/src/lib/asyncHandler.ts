// src/lib/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

// Eliminates try/catch boilerplate in every controller
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

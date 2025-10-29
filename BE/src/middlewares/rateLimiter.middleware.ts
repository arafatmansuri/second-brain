import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../config/redisClient";

export const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login",
  points: 10, // 5 attempts
  duration: 15 * 60, // per 15 minutes
});

// Signup limiter
export const signupLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "signup",
  points: 10, // 10 attempts
  duration: 60 * 60, // per hour
});

export const askAILimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "askai",
  points: 10,
  duration: 60 * 60 * 24,
});

// General API limiter
export const apiLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api",
  points: 100, // 100 requests
  duration: 15 * 60, // per 15 minutes
});

export const rateLimiterMiddleware =
  (limiter: RateLimiterRedis, keyGenerator?: (req: Request) => string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : req.ip || "";
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      res.status(429).json({
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
      });
    }
  };
export const rateLimiterMiddlewareAskAI =
  (limiter: RateLimiterRedis, keyGenerator?: (req: Request) => string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : req.ip || "";
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      res.status(429).json({
        message: "Daily limit reached.",
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
      });
    }
  };
export const userKeyGenerator = (req: Request): string => {
  if (req.userId) {
    return `user:${req.userId}`;
  }
  return req.ip || "";
};

// src/lib/apiResponse.ts
import { type Response } from "express";
import type { CookieType } from "../types.js";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200,
    cookies?: CookieType[],
  ): Response {
    if (cookies && cookies.length > 0) {
      cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    }
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Created",
    cookies?: CookieType[],
  ): Response {
    return ApiResponse.success(res, data, message, 201, cookies);
  }
  static processing<T>(
    res: Response,
    data: T,
    message = "Processing",
    cookies?: CookieType[],
  ): Response {
    return ApiResponse.success(res, data, message, 202, cookies);
  }
  static error<T>(
    res: Response,
    data: T,
    message = "Error",
    cookies?: CookieType[],
  ): Response {
    return ApiResponse.success(res, data, message, 403, cookies);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message = "Success",
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

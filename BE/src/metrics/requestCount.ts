import { NextFunction, Request, Response } from "express";
import {Counter} from "prom-client";

export const requestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

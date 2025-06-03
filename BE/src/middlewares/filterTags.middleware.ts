import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Tags from "../models/tags.model";
import { StatusCode } from "../types";
const contentSchema = z.object({
  link: z.string(),
  type: z.enum([
    "image",
    "video",
    "article",
    "audio",
    "document",
    "tweet",
    "youtube",
    "link",
  ]),
  title: z.string().min(3, { message: "title must be atleast 3 characters" }),
  tags: z.string().array(),
});
export const filterTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contentInput = contentSchema.safeParse(req.body);
    if (!contentInput.success) {
      res.status(StatusCode.InputError).json({
        message: contentInput.error.message || "Every field is required",
      });
      return;
    }
    const inputTags = contentInput.data.tags.map((tag) => ({ title: tag }));
    try {
      await Tags.insertMany(inputTags, { ordered: false });
    } catch (err) {}
    const tags = await Tags.find({
      title: inputTags.map((tag) => tag.title),
    });
    req.tags = tags;
    req.contentInput = contentInput;
    next();
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "something went wrong from our side" });
    return;
  }
};

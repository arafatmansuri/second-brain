import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Tags from "../models/tags.model";
import { StatusCode } from "../types";
import { generateContentLink } from "../utils/generateContentLink";
const contentSchema = z.object({
  title: z
    .string({ message: "title must be a string" })
    .min(3, { message: "title must be atleast 3 characters" }),
  link: z.string({ message: "link must be a string" }),
  type: z.enum(
    [
      "image",
      "video",
      "article",
      "audio",
      "document",
      "tweet",
      "youtube",
      "link",
    ],
    { message: "Invalid content type" }
  ),
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
        message:
          contentInput.error.errors[0].message || "Every field is required",
      });
      return;
    }
    const match = generateContentLink(
      contentInput.data.link,
      contentInput.data.type
    );
    console.log(match);
    if (!match) {
      res.status(StatusCode.InputError).json({ message: "Invalid link" });
      return;
    }
    req.contentLink = match;
    const inputTags = contentInput.data.tags.map((tag) => ({ tagName: tag }));
    try {
      await Tags.insertMany(inputTags, { ordered: false });
    } catch (err) {}
    const tags = await Tags.find({
      tagName: { $in: inputTags.map((tag) => tag.tagName) },
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

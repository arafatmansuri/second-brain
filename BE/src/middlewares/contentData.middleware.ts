import e, { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Tags from "../models/tags.model";
import { StatusCode } from "../types";
import { generateContentLink } from "../utils/generateContentLink";
import { generateSignedUrl } from "../utils/getSignedUrl";
export const contentSchema = z.object({
  title: z
    .string({ message: "title must be a string" })
    .min(3, { message: "title must be atleast 3 characters" }),
  // link: z.enum([z.instanceof(File),z.string()]),
  link: z.string().optional(),
  // link: z.instanceof(File) || z.string({ message: "Link must be string" }),
  type: z.enum(["image", "video", "article", "raw", "tweet", "youtube"], {
    message: "Invalid content type",
  }),
  tags: z.string().array().optional(),
  description: z.string().optional(),
  fileKey: z.string().optional(),
});
export const contentData = async (
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
    let link;
    if (
      contentInput.data.type == "raw" ||
      contentInput.data.type == "video" ||
      contentInput.data.type == "image"
    ) {
      if (!contentInput.data.fileKey) {
        res.status(StatusCode.InputError).json({ message: "File is required" });
        return;
      }else{
        link = await generateSignedUrl(contentInput.data.fileKey);
        req.expiry = new Date(new Date().getTime() + 59 * 60 * 1000);
      }
    } else if (
      contentInput.data.type == "tweet" ||
      contentInput.data.type == "youtube"
    ) {
      link = generateContentLink(
        contentInput.data.link,
        contentInput.data.type
      );
      if (!link) {
        res.status(StatusCode.InputError).json({ message: "Invalid link" });
        return;
      }
    }
    const inputTags =
      contentInput.data.tags &&
      contentInput.data.tags.map((tag) => ({ tagName: tag }));
    try {
      await Tags.insertMany(inputTags, { ordered: false });
    } catch (err) {}
    const tags =
      inputTags &&
      (await Tags.find({
        tagName: { $in: inputTags.map((tag) => tag.tagName) },
      }));
    req.tags = tags;
    req.contentInput = contentInput;
    req.contentLink =
      link !== undefined && typeof link != "string"
        ? link["contentLink"]
        : link;
    req.contentLinkId =
      link !== undefined && typeof link != "string" ? link["id"] : "";
    next();
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "something went wrong from our side" });
    return;
  }
};

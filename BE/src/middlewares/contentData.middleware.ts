import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Tags from "../models/tags.model";
import { StatusCode } from "../types";
import { generateContentLink } from "../utils/generateContentLink";
import { generateSignedUrl } from "../utils/getSignedUrl";
import { isCorrectMediaType, isCorrectMediaTypeByFile } from "../utils/detectMediaType";
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
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  uploadType: z.enum(["file URL", "local file"]).optional(),
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
      (contentInput.data.type == "raw" ||
        contentInput.data.type == "video" ||
        contentInput.data.type == "image") &&
      contentInput.data.uploadType == "local file"
    ) {
      if(isCorrectMediaTypeByFile(contentInput.data.fileType || "", contentInput.data.type) === false){
        res
          .status(StatusCode.InputError)
          .json({ message: "File is not of correct media type" });
        return;
      }
      else if (!contentInput.data.fileKey || !contentInput.data.fileSize) {
        res.status(StatusCode.InputError).json({ message: "File is required" });
        return;
      } else if (contentInput.data.fileSize > 10 * 1024 * 1024) {
        res
          .status(StatusCode.InputError)
          .json({ message: "File is too Large" });
        return;
      } else {
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
    } else if (
      (contentInput.data.type == "image" ||
        contentInput.data.type == "video" ||
        contentInput.data.type == "raw") &&
      contentInput.data.uploadType == "file URL"
    ) {
      const isCorrectType = await isCorrectMediaType(
        contentInput.data.link || "",
        contentInput.data.type
      );
      if (!isCorrectType) {
        res
          .status(StatusCode.InputError)
          .json({ message: "Link is not of correct media type" });
        return;
      }
      link = contentInput.data.link;
    }
    else if(contentInput.data.type == "article" && contentInput.data.link && contentInput.data.uploadType == "file URL"){
      link = contentInput.data.link;
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

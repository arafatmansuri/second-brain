import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Tags from "../models/tags.model";
import { StatusCode } from "../types";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { generateContentLink } from "../utils/generateContentLink";
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
  tags: z.string().array(),
  description: z.string().optional(),
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
    let link;
    let file;
    // console.log(req.file);
    if (
      contentInput.data.type == "raw" ||
      contentInput.data.type == "video" ||
      contentInput.data.type == "image"
    ) {
      let fileLocalPath = "";
      if (req.file) {
        fileLocalPath = req.file.path;
        // console.log(fileLocalPath);
        try {
          if (fileLocalPath) {
            file = await uploadOnCloudinary({
              localFilePath: fileLocalPath,
              type: contentInput.data.type,
            });
          }
          // console.log(file);
          link = file?.secure_url;
        } catch (error) {
          res
            .status(StatusCode.ServerError)
            .json({ message: "Error While Uploading file" });
          file && (await deleteFromCloudinary(file?.public_id));
          return;
        }
      } else {
        res.status(StatusCode.InputError).json({ message: "File is required" });
        return;
      }
    } else
      link = generateContentLink(
        contentInput.data.link,
        contentInput.data.type
      );
    if (!link && contentInput.data.type != "article") {
      res.status(StatusCode.InputError).json({ message: "Invalid link" });
      return;
    }
    req.contentLink = link;
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

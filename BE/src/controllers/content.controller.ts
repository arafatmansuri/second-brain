import { Request, Response } from "express";
import { z } from "zod";
import Content from "../models/content.model";
import Tags from "../models/tags.model";
import { Handler, IContent, StatusCode } from "../types";
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
const getTags = async (req: Request, res: Response) => {
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
  return { tags: tags, contentInput: contentInput };
};
export const addContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const response = await getTags(req, res);
    const contentInput = response?.contentInput;
    const content: IContent = await Content.create({
      link: contentInput?.data.link,
      type: contentInput?.data.type,
      title: contentInput?.data.title,
      tags: response?.tags.map((tag) => tag._id),
      userId: userId,
    });
    res
      .status(StatusCode.Success)
      .json({ message: "Content Added successfully", content });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};
export const updateContent: Handler = async (req, res): Promise<void> => {
  const userId = req.userId;
  const contentId = req.params.id;
  const response = await getTags(req, res);
  const contentInput = response?.contentInput;
  const content = await Content.findOneAndUpdate(
    { $and: [{ _id: contentId, userId: userId }] },
    {
      $set: {
        link: contentInput?.data.link,
        type: contentInput?.data.type,
        title: contentInput?.data.title,
        tags: response?.tags?.map((tag) => tag._id),
        userId: userId,
      },
    }
  );
  if (!content) {
    res.status(StatusCode.NotFound).json({ message: "content not found" });
    return;
  }
  res
    .status(StatusCode.Success)
    .json({ message: "Content updated successfully", content });
  return;
};
export const deleteContent: Handler = async (req, res): Promise<void> => {};
export const displayContent: Handler = async (req, res): Promise<void> => {};
export const displaySharedContent: Handler = async (
  req,
  res
): Promise<void> => {};
export const shareContent: Handler = async (req, res): Promise<void> => {};

import { z } from "zod";
import Content from "../models/content.model";
import Tags from "../models/tags.model";
import { Handler, IContent, ITags, StatusCode } from "../types";
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
export const addContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const contentInput = contentSchema.safeParse(req.body);
    if (!contentInput.success) {
      res.status(StatusCode.InputError).json({
        message: contentInput.error.message || "Every field is required",
      });
      return;
    }
    const inputTags = contentInput.data.tags.map((tag) => {
      return { title: tag };
    });
    try {
      await Tags.insertMany(inputTags, { ordered: false });
    } catch (err) {}
    const tags = await Tags.find({
      title: inputTags.map((tag) => tag.title),
    });
    const content: IContent = await Content.create({
      link: contentInput.data.link,
      type: contentInput.data.type,
      title: contentInput.data.title,
      tags: tags.map((tag) => tag._id),
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
export const updateContent: Handler = async (req, res): Promise<void> => {};
export const deleteContent: Handler = async (req, res): Promise<void> => {};
export const displayContent: Handler = async (req, res): Promise<void> => {};
export const displaySharedContent: Handler = async (
  req,
  res
): Promise<void> => {};
export const shareContent: Handler = async (req, res): Promise<void> => {};

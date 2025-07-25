import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Schema } from "mongoose";
import { s3 } from "../config/s3Config";
import Content from "../models/content.model";
import Link from "../models/link.model";
import User from "../models/user.model";
import { Handler, IContent, StatusCode } from "../types";
import { generateHash } from "../utils/generateHash.util";
import { generateSignedUrl } from "../utils/getSignedUrl";
interface userLinkSchema {
  _id: Schema.Types.ObjectId;
  hash: string;
  userId: { _id: Schema.Types.ObjectId; username: string };
  __v: number;
}
export const addContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const tags = req.tags;
    const contentInput = req.contentInput;
    const content: IContent = await Content.create({
      link: req.contentLink,
      type:
        contentInput.data.type == "raw" ? "document" : contentInput.data.type,
      title: contentInput.data.title,
      tags: tags?.map((tag) => tag._id),
      userId: userId,
      description: contentInput.data.description,
      fileKey: req.fileKey,
      expiry: new Date(new Date().getTime() + 59 * 60 * 1000),
    });
    res
      .status(StatusCode.Success)
      .json({ message: `${content.type} Added successfully`, content });
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
  const tags = req.tags;
  const contentInput = req.contentInput;
  const content = await Content.findOneAndUpdate(
    { $and: [{ _id: contentId, userId: userId }] },
    {
      $set: {
        link: contentInput?.data.link,
        type: contentInput?.data.type,
        title: contentInput?.data.title,
        tags: tags?.map((tag) => tag._id),
        userId: userId,
      },
    },
    { new: true }
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
export const deleteContent: Handler = async (req, res): Promise<void> => {
  try {
    const contentId = req.params.id;
    const userId = req.userId;
    const content = await Content.findOneAndDelete({
      $and: [{ _id: contentId, userId: userId }],
    });
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: content?.fileKey,
    });
    await s3.send(deleteCommand);
    if (!content) {
      res.status(StatusCode.NotFound).json({ message: "No content found" });
      return;
    }
    res
      .status(StatusCode.Success)
      .json({ message: `${content.type} deleted successfully` });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};
export const displayContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const content = await Content.find({ userId: userId }).populate("tags");
    if (
      content.some(
        (c) =>
          (!c.expiry || c.expiry < new Date()) &&
          (c.type == "document" || c.type == "image" || c.type == "video") &&
          c.fileKey
      )
    ) {
      content.map(async (c) => {
        if (
          (!c.expiry || c.expiry < new Date()) &&
          (c.type == "document" || c.type == "image" || c.type == "video") &&
          c.fileKey
        ) {
          c.link = await generateSignedUrl(c.fileKey);
          c.expiry = new Date(new Date().getTime() + 59 * 60 * 1000);
          await c.save({ validateBeforeSave: false });
        }
      });
    }
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!content) {
      res.status(StatusCode.NotFound).json({ message: "No contents found" });
      return;
    }
    res.status(StatusCode.Success).json({
      message: "contents fetched successfully",
      user,
      content,
    });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};
export const displaySharedContent: Handler = async (
  req,
  res
): Promise<void> => {
  try {
    const hash = req.query.share;
    const link = await Link.findOne({ hash: hash })
      .lean()
      .populate("userId", "username");
    if (!link) {
      res
        .status(StatusCode.NotFound)
        .json({ message: "brain is private/doesn't exists" });
      return;
    }
    const content = await Content.find({ userId: link.userId }).populate(
      "tags"
    );
    //@ts-ignore
    const userLink: userLinkSchema = link;
    res.status(StatusCode.Success).json({
      message: "Shared content found",
      username: userLink.userId.username,
      content,
    });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};
export const shareContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const reqType = req.query.reqtype;
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCode.NotFound).json({ message: "User not found" });
      return;
    }
    if (reqType == "private") {
      user.shared = false;
    } else if (reqType == "copy") {
      user.shared = true;
    }
    await user.save({ validateBeforeSave: false });
    const Contentcount = await Content.countDocuments({ userId: userId });
    const link = await Link.findOne({ userId: userId });
    if (!link && user.shared) {
      const hash: string = generateHash(10);
      await Link.create({
        userId: userId,
        hash: hash,
      });
      res.status(StatusCode.Success).json({
        message: `Your brain set to public`,
        link: hash,
        contentCount: Contentcount,
      });
      return;
    } else if (link && user.shared) {
      res.status(StatusCode.Success).json({
        message: `Your brain set to public`,
        link: link?.hash,
        contentCount: Contentcount,
      });
      return;
    } else {
      await Link.deleteMany({ userId: userId });
      res.status(StatusCode.Success).json({
        message: `Your brain set to private`,
      });
      return;
    }
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};

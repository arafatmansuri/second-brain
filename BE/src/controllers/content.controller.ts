import Content from "../models/content.model";
import User from "../models/user.model";
import { Handler, IContent, StatusCode } from "../types";
export const addContent: Handler = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;
    const tags = req.tags;
    const contentInput = req.contentInput;
    const content: IContent = await Content.create({
      link: contentInput.data.link,
      type: contentInput.data.type,
      title: contentInput.data.title,
      tags: tags?.map((tag) => tag._id),
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
    if (!content) {
      res.status(StatusCode.NotFound).json({ message: "No content found" });
      return;
    }
    res
      .status(StatusCode.Success)
      .json({ message: "Content deleted successfully" });
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
    const content = await Content.find({ userId: userId });
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
    const contentId = req.query.id;
    const content = await Content.findOne({ _id: contentId, shared: true });
    const user = await User.findById(content?.userId).select(
      "-password -refreshToken"
    );
    if (!content) {
      res
        .status(StatusCode.NotFound)
        .json({ message: "Content is private/doesn't exists" });
      return;
    }
    res
      .status(StatusCode.Success)
      .json({ message: "Shared content found", user, content });
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
    const contentId = req.params.id;
    const userId = req.userId;
    const content = await Content.findOne({ _id: contentId, userId: userId });
    if (!content) {
      res.status(StatusCode.NotFound).json({ message: "No content found" });
      return;
    }
    content.shared = !content.shared;
    content.save({ validateBeforeSave: false });
    res.status(StatusCode.Success).json({
      message: `Content set to ${content.shared ? "public" : "private"}`,
      link: `${
        content.shared
          ? `http://127.0.0.1:3000/api/v1/content/display?id=${contentId}`
          : ""
      }`,
    });
    return;
  } catch (err) {
    res
      .status(StatusCode.ServerError)
      .json({ message: "Something went wrong from our side" });
    return;
  }
};

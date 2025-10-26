import mongoose from "mongoose";
import { embedData } from "../db/createEmedding";
import Content from "../models/content.model";
export const generateDataAndEmbeddings = async (
  contentId: mongoose.Types.ObjectId
) => {
  const content = await Content.findById(contentId);
  if (!content) return;

  await embedData({
    key: content.fileKey || "",
    contentId: content._id,
    userId: content.userId,
    link: content.link || "",
    linkId: content.contentLinkId || "",
    type: content.type,
    data: content.description || "",
  });

  content.isProcessing = false;
  await content.save({ validateBeforeSave: false });
};

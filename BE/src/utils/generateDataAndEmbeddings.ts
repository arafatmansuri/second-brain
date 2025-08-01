import mongoose from "mongoose";
import { createEmbeddings } from "../db/create-embeddings";
import Content from "../models/content.model";
import Embedding from "../models/embedding.model";
import {
  getDocumentText,
  getPDFTranscript,
  getVideoTransript,
  getYoutubeTranscript,
} from "../utils/getTranscript";
export const generateDataAndEmbeddings = async (
  contentId: mongoose.Types.ObjectId
) => {
  const content = await Content.findById(contentId);
  let data = "";
  switch (content?.type) {
    case "article":
      data = content.description || "";
      break;
    case "image":
      data = await getDocumentText(content.link || "");
      break;
    case "document":
      data = await getPDFTranscript(content.link || "");
      break;
    case "tweet":
      // data = await getTweetDescription(content.contentLinkId || "");
      data = content.description || "";
      break;
    case "youtube":
      data = await getYoutubeTranscript(content.contentLinkId || "");
      break;
    case "video":
      data = await getVideoTransript(content.contentLinkId || "");
      break;
    default:
      break;
  }
  const embeddingCollection = await Embedding.create({
    contentId: content?._id,
    userId: content?.userId,
    data: data,
  });
  await createEmbeddings(data, embeddingCollection._id);
};

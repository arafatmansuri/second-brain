import mongoose from "mongoose";
import { createEmbeddings } from "../db/create-embeddings";
import { embedPDFFromKey } from "../db/createEmedding";
import Content from "../models/content.model";
import Embedding from "../models/embedding.model";
import {
  getDocumentText,
  getImageSummary,
  getTweetDescription2,
  getVideoTransript,
  getYoutubeTranscript,
  getYoutubeTranscriptPy,
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
      data = await getImageSummary(content.link || "");
      break;
    case "document":
      // await getPDFTranscriptPy(content.link || "");
      await embedPDFFromKey(content.fileKey || "", content._id, content.userId,"pdf");
      return;
    case "tweet":
      // data = await getTweetDescription(content.contentLinkId || "");
      await embedPDFFromKey(
        content.contentLinkId || "",
        content._id,
        content.userId,
        "tweet"
      );
      return;
    case "youtube":
      // data = await getYoutubeTranscript(content.contentLinkId || "");
      await embedPDFFromKey(content.contentLinkId || "", content._id, content.userId,"youtube");
      return;
    case "video":
      data = await getVideoTransript(content.link || "",);
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

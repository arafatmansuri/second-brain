import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import {
  getImageSummary,
  getPDFTranscriptPy,
  getTweetDescription2,
  getVideoSummary,
  getVideoTransript,
  getYoutubeTranscriptPy,
} from "../utils/getTranscript";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME!;
const COLLECTION = "embeddings";
// Chunking function (similar to RecursiveCharacterTextSplitter)
function chunkText(text: string) {
  const chunkSize = 500;
  const chunkOverlap = 150;
  const words = text.split(" ");
  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    start += chunkSize - chunkOverlap;
  }
  return chunks;
}
type IEmbedData = {
  key?: string;
  contentId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
  type?: "youtube" | "document" | "tweet" | "image" | "video" | "article";
  link?: string;
  linkId?: string;
  data?: string;
  fileType?: string;
  title?: string;
  description?: string;
  uploadType?:"file URL" | "local file";
};
export async function embedData({
  key,
  contentId,
  userId,
  type,
  link,
  linkId,
  data,
  fileType,
  title,
  description,
  uploadType
}: IEmbedData) {
  try {
    //console.log("🔹 Loading Xenova embedding model...");
    const embedder = await pipeline(
      "feature-extraction",
      // "Xenova/all-MiniLM-L6-v2"
      "Xenova/nomic-embed-text-v1"
    );
    //console.log("⚙️ Embedding pages...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION);

    //console.log("⏳ Extracting PDF from key...");
    if (type == "document") {
      console.log("Extracting PDF from key...",key,uploadType,link);
      const docs = await getPDFTranscriptPy(key || "",uploadType || "file URL",link);
      for (const doc of docs) {
        const textChunks = chunkText(doc.text);
        for (const chunk of textChunks) {
          const embedding = await embedder(chunk, {
            pooling: "mean",
            normalize: true,
          });
          await collection.insertOne({
            embedding: Array.from(embedding.data),
            data: chunk.trim(),
            // title: doc.metadata.title,
            // producer: doc.metadata.producer,
            // creator: doc.metadata.creator,
            // creationdate: doc.metadata.creationdate,
            // author: doc.metadata.author,
            // moddate: doc.metadata.moddate,
            // page: doc.metadata.page,
            // page_label: doc.metadata.page_label,
            contentId,
            userId,
            ...doc.metadata,
            // hasCode: false, // can later detect code if needed
            // keywords: [],   // can auto-tag later
            // source: doc.metadata.source,
            // total_docs: doc.metadata.pages,
          });
        }
      }
    } else if (type == "youtube") {
      const transcript = await getYoutubeTranscriptPy(linkId || "");
      for (const chunk of transcript) {
        let transcriptData = chunk?.data || JSON.stringify({ ...chunk });
        const embedding = await embedder(transcriptData, {
          pooling: "mean",
          normalize: true,
        });
        await collection.insertOne({
          embedding: Array.from(embedding.data),
          contentId,
          userId,
          ...chunk,
        });
      }
    } else if (type == "tweet") {
      const fullTweetData = await getTweetDescription2(linkId || "");
      const tweetData =
        fullTweetData.extendedTweet || fullTweetData.full_text || "";
      const embedding = await embedder(tweetData, {
        pooling: "mean",
        normalize: true,
      });
      await collection.insertOne({
        embedding: Array.from(embedding.data),
        contentId,
        userId,
        ...fullTweetData,
        data: tweetData,
      });
    } else if (type == "image") {
      const imageData = await getImageSummary(link || "", fileType);
      const embedding = await embedder(imageData, {
        pooling: "mean",
        normalize: true,
      });
      let parsedImageData = {};
      try {
        parsedImageData = JSON.parse(imageData);
      } catch (error) {
        console.log("Invalid JSON");
      }
      await collection.insertOne({
        embedding: Array.from(embedding.data),
        contentId,
        userId,
        data: imageData,
        ...parsedImageData,
      });
    } else if (type == "video") {
      let videoData = await getVideoTransript(link || "");
      if (videoData == "") {
        videoData = await getVideoSummary(link || "", fileType);
      }
      const embedding = await embedder(videoData, {
        pooling: "mean",
        normalize: true,
      });
      await collection.insertOne({
        embedding: Array.from(embedding.data),
        contentId,
        userId,
        data: videoData,
      });
    } else if (type == "article") {
      const embedding = await embedder(data || "", {
        pooling: "mean",
        normalize: true,
      });
      await collection.insertOne({
        embedding: Array.from(embedding.data),
        contentId,
        userId,
        data,
        title,
      });
    }

    await client.close();
    //console.log("✅ Embeddings stored in MongoDB.");
  } catch (err) {
    console.log(err);
  }
}

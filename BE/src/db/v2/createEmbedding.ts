import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import {
  getImageSummary,
  getPDFTranscriptPy,
  getTextFromArticleURL,
  getTweetDescription2,
  getVideoSummary,
  getVideoTransript,
  getYoutubeSummary,
  getYoutubeTranscriptPy,
} from "../../utils/getTranscript";
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
  uploadType?: "file URL" | "local file";
};
export const generatedEmbeddings = async (data: string) => {
    const embedder = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY });
    const embedding = await embedder.models.embedContent({
        model:"gemini-embedding-2",
        contents: data,
        config:{
            outputDimensionality: 768,
        }
    });
    if (embedding && embedding.embeddings && embedding.embeddings[0])
      return embedding.embeddings[0].values;
    else return null;
}
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
  uploadType,
}: IEmbedData) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION);

    //console.log("⏳ Extracting PDF from key...");
    if (type == "document") {
      // console.log("Extracting PDF from key...",key,uploadType,link);
      const docs = await getPDFTranscriptPy(
        key || "",
        uploadType || "file URL",
        link,
      );
      for (const doc of docs) {
        const textChunks = chunkText(doc.text);
        for (const chunk of textChunks) {
          const embedding = await generatedEmbeddings(chunk);
          await collection.insertOne({
            embedding: embedding,
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
      if (!transcript || transcript.length === 0) {
        const videoSummary = await getYoutubeSummary(link || "");
        let parsedSummary = {
          content: "",
        };
        try {
          parsedSummary = JSON.parse(videoSummary);
        } catch (error) {
          console.log("Invalid JSON");
        }
        const parsedContent =
          parsedSummary.content.length > 0
            ? parsedSummary.content
            : videoSummary;
        const embedding = await generatedEmbeddings(parsedContent);
        await collection.insertOne({
          embedding: embedding,

          contentId,
          userId,
          data: parsedSummary.content.length <= 0 && videoSummary,
          ...parsedSummary,
        });
        await client.close();
        return;
      }
      for (const chunk of transcript) {
        let transcriptData = chunk?.data || JSON.stringify({ ...chunk });
        const embedding = await generatedEmbeddings(transcriptData);
        await collection.insertOne({
          embedding: embedding,
          contentId,
          userId,
          ...chunk,
        });
      }
    } else if (type == "tweet") {
      const fullTweetData = await getTweetDescription2(linkId || "");
      const tweetData =
        fullTweetData.extendedTweet || fullTweetData.full_text || "";
      const embedding = await generatedEmbeddings(tweetData);
      await collection.insertOne({
        embedding: embedding,
        contentId,
        userId,
        ...fullTweetData,
        data: tweetData,
      });
    } else if (
      type == "image" ||
      type == "video" ||
      (type == "article" && uploadType == "file URL")
    ) {
      let data =
        type == "image"
          ? await getImageSummary(link!, fileType)
          : type == "video"
            ? await getVideoTransript(link!)
            : await getTextFromArticleURL(link!);
      console.log("Image data: ", data);
      let isVideoSummary = false;
      if (type == "video" && !data) {
        isVideoSummary = true;
        data = await getVideoSummary(link!, fileType);
      }
      let parsedData = {
        content: "",
      };
      try {
        if (type !== "video" && !isVideoSummary) parsedData = JSON.parse(data);
      } catch (error) {
        console.log("Invalid JSON");
      }
      const parsedContent =
        parsedData.content.length > 0 ? parsedData.content : data;
      // console.log("parsed Content: ", parsedContent);
      const embedding = await generatedEmbeddings(parsedContent);
      await collection.insertOne({
        embedding: embedding,
        contentId,
        userId,
        ...parsedData,
        data: (!isVideoSummary || parsedData.content.length <= 0) && data,
      });
    } else if (type == "article" && uploadType == "local file") {
      const embedding = await generatedEmbeddings(data!);
      await collection.insertOne({
        embedding: embedding,
        contentId,
        userId,
        data,
      });
    }

    await client.close();
    //console.log("✅ Embeddings stored in MongoDB.");
  } catch (err) {
    console.log(err);
  }
}

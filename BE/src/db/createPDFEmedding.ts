import { getPDFTranscriptPy } from "../utils/getTranscript";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME!;
const COLLECTION = "embeddings";
export async function embedPDFFromURL(
  url: string,
  contentId?: mongoose.Types.ObjectId,
  userId?: mongoose.Types.ObjectId | null
) {
  try {
    //console.log("⏳ Extracting PDF from URL...");
    const docs = await getPDFTranscriptPy(url);
  
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
  
    // Chunking function (similar to RecursiveCharacterTextSplitter)
    const chunkSize = 500;
    const chunkOverlap = 150;
    function chunkText(text: string) {
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
  
    for (const doc of docs) {
      const textChunks = chunkText(doc.text);
      for (const chunk of textChunks) {
        const embedding = await embedder(chunk, {
          pooling: "mean",
          normalize: true,
        });
        await collection.insertOne({
          embedding: Array.from(embedding.data),
          title: doc.metadata.title,
          data: chunk.trim(),
          // hasCode: false, // can later detect code if needed
          // keywords: [],   // can auto-tag later
          producer: doc.metadata.producer,
          creator: doc.metadata.creator,
          creationdate: doc.metadata.creationdate,
          author: doc.metadata.author,
          moddate: doc.metadata.moddate,
          // source: doc.metadata.source,
          // total_docs: doc.metadata.pages,
          page: doc.metadata.page,
          page_label: doc.metadata.page_label,
          contentId,
          userId
        });
      }
    }
  
    await client.close();
    //console.log("✅ Embeddings stored in MongoDB.");
  } catch (err) {
    console.log(err);
  }
}

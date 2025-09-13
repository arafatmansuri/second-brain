import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { searchFromEmbeddings } from "../db/vector-query";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY });
export async function generateAnswer(
  query: string,
  userId: mongoose.Types.ObjectId | undefined
) {
  const context = await searchFromEmbeddings(query, userId);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `"You're a chat bot who just answer the question that is asked to you, no other stuffs", Here's is the context which is data fetched using emmbedding ans it has thier scores of related data, more higher score it has the correct answer OR if the context is not provided or context is not proper as per you can also create answer your self: ${JSON.stringify(
      context
    )} based on this data answer the following question in detail: "${query}"`,
  });
  return response.text;
}

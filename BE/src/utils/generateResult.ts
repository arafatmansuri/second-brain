import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { searchFromEmbeddings } from "../db/vectorQuery";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY });
export async function generateAnswer(
  query: string,
  userId: mongoose.Types.ObjectId | undefined
) {
  try {
    const context = await searchFromEmbeddings(query, userId);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context:${JSON.stringify(context)}
          Question:${query}
      `,
      config: {
        systemInstruction: `You are a precise and context-aware assistant.You are given a set of contextual data retrieved from a vector database. 
          Use only the provided context to answer the user's question.
          Rules:
          1.'If the context contains enough relevant information, generate a clear and concise answer strictly based on that information.' 
          2.'If the context does not contain any relevant or sufficient data to answer, respond exactly with:**No related data found.**' 
          3.'Do not include or assume any facts not present in the context.'
          4.'Do not repeat or describe the context — just use it to formulate your answer.' 
          5.'Prefer factual, well-structured, and brief answers.' 
          6.'Avoid speculation, personal opinions, or general knowledge unless explicitly mentioned in the context.'
          7.'Return the final output strictly as a JSON object.' 
          8.'Output only the JSON object — no text, no explanation, no code block formatting. Don't use any *** *** to display header just use numbering.'
          9.'Do not include triple backticks or any labels like 'json'.' 
          10.'Ensure the JSON is properly formatted and parsable. the fields: answer=>The Answer of the question from given context, contentId=>The contentId from which you gave the answer from It can be more than one so provide an array of contentId.'`,
      },
    });
    // console.log("final array", JSON.stringify(context));
    const { answer, contentId } = JSON.parse(
      response.text || `{answer:"",contentId:[]}`
    );
    // return { result: response.text, contentIds: context.map((c) => c.contentId) };
    return { result: answer, contentIds: contentId };
  } catch (err) {
    console.log(err);
    return { result: "", contentIds: [] };
  }
}

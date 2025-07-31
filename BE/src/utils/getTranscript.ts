import { AssemblyAI, TranscribeParams } from "assemblyai";
import axios from "axios";
import pdf from "pdf-parse";
import { createWorker } from "tesseract.js";
import { YoutubeTranscript } from "youtube-transcript";
export const getVideoTransript = async (link: string) => {
  try {
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLY_AI as string,
    });

    const audioFile = link;

    const params: TranscribeParams = {
      audio: audioFile,
      speech_model: "universal",
    };
    const transcript = await client.transcripts.transcribe(params);

    console.log(transcript.text);
    return transcript.text || "";
  } catch (err) {
    console.log("Assembly transcipt error", err);
    return "";
  }
};

export const getYoutubeTranscript = async (id: string) => {
  const transcript = await YoutubeTranscript.fetchTranscript(id);
  const data: string[] = transcript.map((t) => t.text);
  return data.join(",");
};

export const getPDFTranscript = async (url: string) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);
    console.log("Extracted Text:", data.text);
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF:", error);
    return "";
  }
};
export const getTweetDescription = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://api.x.com/2/tweets/${id}?tweet.fields=id,text`,
      {
        headers: {
          Authorization: process.env.X_BEARER_TOKEN,
        },
      }
    );
    return response.data.data.text;
  } catch (err) {
    return "";
  }
};

export const getDocumentText = async (link: string) => {
  const worker = await createWorker("eng", 1, {
    logger: (m) => console.log(m),
  });
  const ret = await worker.recognize(link);
  console.log(ret.data.text);
  await worker.terminate();
  return ret.data.text;
};

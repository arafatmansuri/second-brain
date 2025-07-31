import { AssemblyAI, TranscribeParams } from "assemblyai";
import pdf from "pdf-parse";

import { YoutubeTranscript } from "youtube-transcript";
export const getTransript = async (link: string) => {
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
    return transcript.text;
  } catch (err) {
    console.log("Assembly transcipt error", err);
    return null;
  }
};

export const getYoutubeTranscript = async (id: string) => {
  const transcript = await YoutubeTranscript.fetchTranscript(id);
  return transcript;
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

import { AssemblyAI, TranscribeParams } from "assemblyai";

export const getTransript = async (link:string) => {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI as string,
  });

  const audioFile = link;

  const params:TranscribeParams = {
    audio: audioFile,
    speech_model: "universal",
  };
  const transcript = await client.transcripts.transcribe(params);

  console.log(transcript.text);
  return transcript.text;
}
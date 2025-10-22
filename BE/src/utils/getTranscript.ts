import { AssemblyAI, TranscribeParams } from "assemblyai";
import axios from "axios";
import { spawn } from "child_process";
import fetch from "node-fetch";
import path from "path";
import { createWorker } from "tesseract.js";
import { YoutubeTranscript } from "youtube-transcript";

// const __filename = __filename || path.resolve();
// const __dirname = dirname(__filename);
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

    // console.log(transcript.text);
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
    const pdf = (await import("pdf-parse")).default;
    const data = await pdf(buffer);
    //console.log("Extracted Text:", data.text);
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF:", error);
    return "";
  }
};
export const getPDFTranscriptPy = async (key: string): Promise<any[]> => {
  try {
    const pythonPath =
      process.env.NODE_ENV == "development" ? "python" : "./venv/bin/python";
    return new Promise((resolve, reject) => {
      const py = spawn(pythonPath || "python", [path.join(__dirname, "extractPDF.py"), key]);
      let data = "";
      py.stdout.on("data", (chunk) => {
        data += chunk;
      });
      py.stderr.on("data", (err) => console.error(err.toString()));

      py.on("close", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (error) {
    console.error("Error extracting PDF:", error);
    return [];
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
    // logger: (m) => console.log(m),
  });
  const ret = await worker.recognize(link);
  // console.log(ret.data.text);
  await worker.terminate();
  return ret.data.text;
  // return "ret.data.text";
};

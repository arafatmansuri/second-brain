import { GoogleGenAI } from "@google/genai";
import { AssemblyAI, TranscribeParams } from "assemblyai";
import axios from "axios";
import { spawn } from "child_process";
import fetch from "node-fetch";
import path from "path";
import { createWorker } from "tesseract.js";
import { fileURLToPath } from "url";
import { YoutubeTranscript } from "youtube-transcript";
const pythonPath =
  process.env.NODE_ENV == "development" ? "python" : "./venv/bin/python";
// const __filename = __filename || path.resolve();
// const __dirname = dirname(__filename);
//@ts-ignore
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
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
interface YoutubeData {
  title: string;
  description: string;
  staticstics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  duration: string;
  channelName: string;
}
export const getYoutubeTranscriptPy = async (
  id: string
): Promise<
  {
    data?: string;
    start?: number;
    end?: number;
    videoTitle: string;
    description: string;
    staticstics: string;
    duration: string;
    channelName: string;
  }[]
> => {
  const resposne = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${process.env.YOUTUBE_DATA_KEY}`
  );
  const ytData: YoutubeData = {
    title: resposne.data["items"][0]["snippet"]["title"],
    description: resposne.data["items"][0]["snippet"]["description"],
    staticstics: resposne.data["items"][0]["statistics"],
    duration: resposne.data["items"][0]["contentDetails"]["duration"],
    channelName: resposne.data["items"][0]["snippet"]["channelTitle"],
  };

  return new Promise((resolve, reject) => {
    const py = spawn(pythonPath || "python", [
      path.join(__dirname, "extractData.py"),
      "youtube",
      id,
      JSON.stringify(ytData),
    ]);
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
    return new Promise((resolve, reject) => {
      const py = spawn(pythonPath || "python", [
        path.join(__dirname, "extractData.py"),
        "pdf",
        key,
      ]);
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
interface TweetResponse {
  full_text?: string;
  extendedTweet?: string;
  username?: string;
  userDescription?: string;
  createdAt?: string;
  totalLikes?: number;
  totalViews?: string;
  totalFollowers?: number;
  totalFollowings?: number;
  media?: { type: string; media_url_https: string }[] | boolean;
}
export const getTweetDescription2 = async (
  id: string
): Promise<TweetResponse> => {
  try {
    const response = await axios.get(
      `https://twitter241.p.rapidapi.com/tweet`,
      {
        params: { pid: id },
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        },
      }
    );
    const res = response.data;
    const isNoteTweet = res.data.threaded_conversation_with_injections_v2
      .instructions[1].entries[0].content.itemContent.tweet_results.result
      .note_tweet
      ? true
      : false;
    const data: TweetResponse = {
      full_text:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.legacy
          .full_text || "",
      extendedTweet: isNoteTweet
        ? res.data.threaded_conversation_with_injections_v2.instructions[1]
            .entries[0].content.itemContent.tweet_results.result.note_tweet
            .note_tweet_results.result.ext
        : "",
      username:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.core.user_results
          .result.legacy.name || "",
      userDescription:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.core.user_results
          .result.legacy.description || "",
      createdAt:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.legacy
          .created_at || "",
      totalLikes:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.legacy
          .favorite_count || "",
      totalViews:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.views.count ||
        "",
      totalFollowers:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.core.user_results
          .result.legacy.followers_count || "",
      totalFollowings:
        res.data.threaded_conversation_with_injections_v2.instructions[1]
          .entries[0].content.itemContent.tweet_results.result.core.user_results
          .result.legacy.friends_count || "",
      media:
        res.data.threaded_conversation_with_injections_v2.instructions[1].entries[0].content.itemContent.tweet_results.result.legacy.extended_entities.media.map(
          (m: { type: string; media_url_https: string }) =>
            m.type == "photo" && m.media_url_https
        ) || [],
    };
    return data;
  } catch (err) {
    return {
      username: "",
      createdAt: "",
      extendedTweet: "",
      full_text: "",
      media: false,
      totalFollowers: 0,
      totalFollowings: 0,
      totalLikes: 0,
      totalViews: "",
      userDescription: "",
    };
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
export const getImageSummary = async (link: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY });

  const response = await fetch(link);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64ImageData,
        },
      },
      { text: "Caption this image." },
    ],
  });
  return result?.text || "";
};

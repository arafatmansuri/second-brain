import { GoogleGenAI } from "@google/genai";
import { AssemblyAI, TranscribeParams } from "assemblyai";
import axios from "axios";
import { spawn } from "child_process";
import fetch from "node-fetch";
import path from "path";
import { createWorker } from "tesseract.js";
// import { fileURLToPath } from "url";
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
    // console.log("Transcript:", transcript);
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
export const getPDFTranscriptPy = async (
  key: string,
  uploadType: "file URL" | "local file",
  link?: string
): Promise<any[]> => {
  try {
    return new Promise((resolve, reject) => {
      const py = spawn(pythonPath || "python", [
        path.join(__dirname, "extractData.py"),
        "pdf",
        key,
        uploadType,
        link || "",
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
export const getImageSummary = async (link: string, fileType?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY2 });

  const response = await fetch(link);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: fileType || "image/jpeg",
          data: base64ImageData,
        },
      },
      {
        text: "You are an expert document analyst. Your task is to extract, understand, and clean the textual and structural content from the given image. The goal is to produce text that captures all the *meaningful information* for semantic embedding, removing visual clutter or irrelevant layout details.Follow these rules carefully:1. Read and interpret **all readable text** in the image, including headings, tables, and annotations.2. If the image contains structured data (tables, lists, charts), **convert it to plain text format** with clear labels.3. **Preserve key context**, logical relationships, and meanings — not formatting or coordinates.4. **Ignore** decorative elements, watermarks, page numbers, or repeated headers/footers.5. If the image contains multiple sections, summarize each one clearly under a heading.6. For handwritten or unclear text, make your **best guess** but note uncertainty in brackets `[unclear: word]`.7. Return the final output strictly as a JSON object. 8.Output only the JSON object — no text, no explanation, no code block formatting. 9.Do not include triple backticks (```) or any labels like 'json'. 10. Ensure the JSON is properly formatted and parsable. the fields: title, content, summary, and keywords.Output format: ---Title: [If the image has a clear title or heading]Main Content:[Cleaned, structured text here] Summary (optional):[A 2–3 line summary capturing main topic or insight] Keywords:[List of 5–10 relevant keywords]---",
      },
    ],
  });
  return result?.text || "";
};
export const getVideoSummary = async (link: string, fileType?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY2 });

  const response = await fetch(link);
  const videoArrayBuffer = await response.arrayBuffer();
  const base64VideoData = Buffer.from(videoArrayBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: fileType || "video/mp4",
          data: base64VideoData,
        },
      },
      {
        text: `You are an expert video analyst. Your task is to extract, understand, and clean the spoken and visual content from the given video. The goal is to produce text that captures all the *meaningful information* for semantic embedding, removing visual clutter or irrelevant details.Follow these rules carefully:
        1. Transcribe **all spoken dialogue** in the video, including conversations, narrations, and on-screen text.
        2. If the video contains structured data (charts, graphs, tables), **convert it to plain text format** with clear labels.
        3. **Preserve key context**, logical relationships, and meanings — not formatting or coordinates.
        4. **Ignore** decorative elements, watermarks, or repeated intros/outros.5. If the video contains multiple sections or scenes, summarize each one clearly under a heading.
        6. For unclear audio or visuals, make your **best guess** but note uncertainty in brackets '[unclear: word]'.
        7. Return the final output strictly as a JSON object.
        8.Output only the JSON object — no text, no explanation, no code block formatting.
        9.Do not include triple backticks (\`\`\`) or any labels like 'json'. 10. Ensure the JSON is properly formatted and parsable. 
        the fields: title, content, summary, and keywords.Output format: ---Title: [If the video has a clear title or heading]
        Main Content:[Cleaned, structured text here] 
        Summary (optional):[A 2-3 line summary capturing main topic or insight] Keywords:[List of 5-10 relevant keywords]---`,
      },
    ],
  });
  return result?.text || "";
};
export const getYoutubeSummary = async (link: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_GEMENI_KEY2 });

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        fileData: {
          fileUri: link,
        },
      },
      {
        text: `You are an expert video analyst. Your task is to extract, understand, and clean the spoken and visual content from the given video. The goal is to produce text that captures all the *meaningful information* for semantic embedding, removing visual clutter or irrelevant details.Follow these rules carefully:
        1. Transcribe **all spoken dialogue** in the video, including conversations, narrations, and on-screen text.
        2. If the video contains structured data (charts, graphs, tables), **convert it to plain text format** with clear labels.
        3. **Preserve key context**, logical relationships, and meanings — not formatting or coordinates.
        4. **Ignore** decorative elements, watermarks, or repeated intros/outros.5. If the video contains multiple sections or scenes, summarize each one clearly under a heading.
        6. For unclear audio or visuals, make your **best guess** but note uncertainty in brackets '[unclear: word]'.
        7. Return the final output strictly as a JSON object.
        8.Output only the JSON object — no text, no explanation, no code block formatting.
        9.Do not include triple backticks (\`\`\`) or any labels like 'json'. 10. Ensure the JSON is properly formatted and parsable. 
        the fields: title, content, summary, and keywords.Output format: ---Title: [If the video has a clear title or heading]
        Main Content:[Cleaned, structured text here] 
        Summary (optional):[A 2-3 line summary capturing main topic or insight] Keywords:[List of 5-10 relevant keywords]---`,
      },
    ],
  });
  return result?.text || "";
};

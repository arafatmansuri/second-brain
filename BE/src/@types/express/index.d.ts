import mongoose from "mongoose";
import { z } from "zod";
import { ITags } from "../../types";
//Custom Request Objects:
declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId;
      tags?: ITags[];
      contentInput: z.SafeParseSuccess<{
        type: "image" | "video" | "article" | "raw" | "tweet" | "youtube";
        link?: string;
        title: string;
        tags: string[];
        description?: string;
      }>;
      contentLink?: string | null;
      fileKey?: string;
    }
  }
}

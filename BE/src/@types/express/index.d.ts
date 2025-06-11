import mongoose from "mongoose";
import { ITags } from "../../types";

//Custom Request Objects:
declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId;
      tags?: ITags[];
      contentInput?: any;
      contentLink: string;
    }
  }
}

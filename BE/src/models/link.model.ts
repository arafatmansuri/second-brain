import mongoose, { Schema } from "mongoose";
import { ILinkDocument } from "../types";
const linkSchema: Schema<ILinkDocument> = new Schema<ILinkDocument>({
  hash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
});

const Link: mongoose.Model<ILinkDocument> = mongoose.model<ILinkDocument>(
  "Link",
  linkSchema
);

export default Link;

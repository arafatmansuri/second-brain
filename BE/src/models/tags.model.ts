import { model, Model, Schema } from "mongoose";
import { ITags } from "../types";

const tagsSchema: Schema<ITags> = new Schema<ITags>({
  tagName: { type: String, required: true, unique: true },
});

tagsSchema.index({ tagName: 1 }, { unique: true });

const Tags: Model<ITags> = model<ITags>("Tags", tagsSchema);

export default Tags;

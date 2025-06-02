import { model, Model, Schema } from "mongoose";
import { ITags } from "../types";

const tagsSchema: Schema<ITags> = new Schema<ITags>({
  title: { type: String, required: true },
});

const Tags: Model<ITags> = model<ITags>("Tags", tagsSchema);

export default Tags;

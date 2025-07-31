import { model, Schema } from "mongoose";

const tagsSchema = new Schema({
  tagName: { type: String, required: true, unique: true },
});

// tagsSchema.index({ tagName: 1 }, { unique: true });

const Tags = model("Tags", tagsSchema);

export default Tags;

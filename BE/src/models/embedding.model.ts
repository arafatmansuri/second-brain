import { model, Schema } from "mongoose";

const embeddingSchema = new Schema({
  data: String,
  embedding: [],
  contentId: { type: Schema.Types.ObjectId, ref: "Content" },
});

const Embedding = model("Embedding", embeddingSchema);

export default Embedding;

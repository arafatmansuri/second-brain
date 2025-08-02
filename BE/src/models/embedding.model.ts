import { model, Schema } from "mongoose";

const embeddingSchema = new Schema({
  data: {type:String},
  embedding: [],
  contentId: { type: Schema.Types.ObjectId, ref: "Content" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

const Embedding = model("Embedding", embeddingSchema);

export default Embedding;

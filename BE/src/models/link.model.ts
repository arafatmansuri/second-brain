import mongoose, { Schema } from "mongoose";
const linkSchema = new Schema({
  hash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
});

const Link = mongoose.model("Link", linkSchema);

export default Link;

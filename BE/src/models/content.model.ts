import { model, Model, Schema } from "mongoose";
import { IContent } from "../types";
import User from "./user.model";

const cotnentSchema: Schema<IContent> = new Schema<IContent>({
  link: { type: String, required: true },
  type: {
    type: String,
    enum: ["image", "video", "article", "audio"],
    required: true,
  },
  title: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

cotnentSchema.pre("save", async function (next) {
  const user = await User.findById(this.userId);
  if (!user) {
    throw new Error("User doesn't exists");
  }
  next();
});

const Content: Model<IContent> = model<IContent>("Content", cotnentSchema);

export default Content;

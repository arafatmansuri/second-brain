import { model, Schema } from "mongoose";
import User from "./user.model";

const contentSchema = new Schema(
  {
    link: { type: String },
    type: {
      type: String,
      enum: ["image", "video", "article", "document", "tweet", "youtube"],
      required: true,
    },
    title: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    fileKey: { type: String },
    expiry: { type: Date },
    contentLinkId: { type: String },
    fileType:{type:String},
    fileSize:{type:Number},
    isProcessing:{type:Boolean},
    uploadType:{type:String, enum:["file URL","local file"]},
  },
  { timestamps: true }
);

contentSchema.pre("save", async function (next) {
  const user = await User.findById(this.userId);
  if (!user) {
    throw new Error("User doesn't exists");
  }
  next();
});

const Content = model("Content", contentSchema);

export default Content;

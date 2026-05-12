import { model, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    contentIds: [{ type: Schema.Types.ObjectId, ref: "Content" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Project = model("Project", projectSchema);

export default Project;
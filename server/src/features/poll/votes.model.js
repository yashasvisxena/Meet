import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    poll: { type: Schema.Types.ObjectId, ref: "Poll", required: true },
    option: { type: Schema.Types.ObjectId, required: true }, // refers to Poll.options._id
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

voteSchema.index({ poll: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);

import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    poll: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },
    option: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

voteSchema.index({ poll: 1, user: 1 }, { unique: true });
voteSchema.index({ poll: 1, option: 1 });

export const Vote = mongoose.model("Vote", voteSchema);

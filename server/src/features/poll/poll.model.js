import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema({
  text: { type: String, required: true },
});

const pollSchema = new Schema(
  {
    meeting: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
    question: { type: String, required: true },
    options: [optionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);

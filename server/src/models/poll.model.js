import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const pollSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },
    question: { type: String, required: true, trim: true },
    options: [optionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "active",
    },
    endTime: { type: Date },
  },
  { timestamps: true }
);

pollSchema.index({ meeting: 1, status: 1 });

export const Poll = mongoose.model("Poll", pollSchema);

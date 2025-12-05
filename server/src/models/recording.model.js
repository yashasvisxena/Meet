import mongoose, { Schema } from "mongoose";

const recordingSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },

    title: { type: String, trim: true },

    storage: { type: String, enum: ["file", "ipfs"], default: "file" },

    fileUrl: { type: String },
    ipfsCid: { type: String, index: true },
    fileHash: { type: String, trim: true },
    solanaTxId: { type: String, index: true },

    isVerified: { type: Boolean, default: false },

    uploader: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

recordingSchema.index({ meeting: 1, createdAt: -1 });

recordingSchema.pre("validate", function (next) {
  if (!this.fileUrl && !this.ipfsCid) {
    return next(new Error("Recording must have either fileUrl or ipfsCid"));
  }
  next();
});

export default mongoose.model("Recording", recordingSchema);

import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    storage: { type: String, enum: ["file", "ipfs"], default: "file" },
    fileUrl: { type: String },
    ipfsCid: { type: String, index: true },
    fileHash: { type: String, trim: true },
    solanaTxId: { type: String, index: true },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const chatMessageSchema = new Schema(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    messageType: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },

    content: { type: String, trim: true },

    attachments: [attachmentSchema],

    systemAction: {
      type: String,
      enum: [
        "user_joined",
        "user_left",
        "recording_started",
        "recording_stopped",
        "poll_started",
      ],
    },
  },
  { timestamps: true }
);

// Indexes
chatMessageSchema.index({ meeting: 1, createdAt: -1 });
chatMessageSchema.index({ meeting: 1, receiver: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

// Validation rules
chatMessageSchema.pre("validate", function (next) {
  if (this.messageType === "text" || this.messageType === "system") {
    if (!this.content) {
      return next(new Error("Content is required for text/system messages"));
    }
  }
  if (
    this.messageType === "file" &&
    (!this.attachments || this.attachments.length === 0)
  ) {
    return next(new Error("File messages must have at least one attachment"));
  }
  next();
});

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

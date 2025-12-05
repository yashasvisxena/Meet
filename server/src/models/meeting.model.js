import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    organisation: { type: Schema.Types.ObjectId, ref: "Organisation" },

    host: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    members: [{ type: Schema.Types.ObjectId, ref: "User" }],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meta: {
      permissions: {
        canMuteSomeone: { type: [String], default: ["host"] },
        canAdmitPeople: { type: [String], default: ["host"] },
        canEndMeeting: { type: [String], default: ["host"] },
        canEditSettings: { type: [String], default: ["host"] },
      },
      settings: {
        waitingRoomEnabled: { type: Boolean, default: true },
      },
    },

    meta_data: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {
        maxParticipants: 0, // 0 means unlimited
      },
    },

    startDateTime: { type: Date, required: true },
    endDateTime: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > this.startDateTime;
        },
        message: "End time must be after start time",
      },
    },

    gCalendarEventId: { type: String },
    recordingId: { type: String },

    isSolanaGated: { type: Boolean, default: false },
    solanaGate: {
      whitelist: [{ type: String }],
      token: {
        mintAddress: { type: String },
        minAmount: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// ---- Pre-save hooks ----
meetingSchema.pre("save", function (next) {
  // If meeting is Solana-gated, enforce rules
  if (this.isSolanaGated) {
    if (
      (!this.solanaGate.whitelist || this.solanaGate.whitelist.length === 0) &&
      !this.solanaGate.token.mintAddress
    ) {
      return next(
        new Error("Solana-gated meeting must have whitelist or token rules")
      );
    }
  }

  // Ensure creator is also in host array
  if (this.isNew && this.createdBy) {
    if (!this.host || this.host.length === 0) {
      this.host = [this.createdBy];
    } else if (!this.host.includes(this.createdBy)) {
      this.host.unshift(this.createdBy); // ensure creator is first host
    }
  }

  next();
});

/**
 * Check if a user has permission to perform a certain action
 */
meetingSchema.methods.canUserPerform = function (userId, action) {
  let role;
  if (this.host.some((h) => h.equals(userId))) role = "host";
  else if (this.members.some((m) => m.equals(userId))) role = "member";
  else return false;

  const allowedRoles = this.meta.permissions[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(role);
};

meetingSchema.index({ startDateTime: 1, endDateTime: 1 });
meetingSchema.index({ organisation: 1 });
meetingSchema.index({ host: 1 });

export const Meeting = mongoose.model("Meeting", meetingSchema);

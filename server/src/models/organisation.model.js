import mongoose, { Schema } from "mongoose";

// ---- Role Schema ----
const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

// ---- Organisation Schema ----
const organisationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
    },

    roles: [roleSchema],

    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: Schema.Types.ObjectId, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    settings: {
      allowGuestUsers: { type: Boolean, default: false },
      maxMembers: { type: Number, default: 100 },
    },

    meetings: [{ type: Schema.Types.ObjectId, ref: "Meeting" }],
    logs: [{ type: Schema.Types.ObjectId, ref: "Log" }],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

organisationSchema.pre("save", function (next) {
  if (this.isNew) {
    const hasAdmin = this.roles.some(
      (role) => role.name.toLowerCase() === "admin"
    );

    if (!hasAdmin) {
      this.roles.push({
        name: "Admin",
        permissions: new Map([["*", true]]),
      });
    }
  }
  next();
});

export const Organisation = mongoose.model("Organisation", organisationSchema);

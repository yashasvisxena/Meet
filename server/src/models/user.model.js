import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/index.js";

const userSchema = new Schema(
  {
    // Full name of the user (always required)
    name: {
      type: String,
      required: true,
      index: true,
    },

    // Email (always required, unique, stored in lowercase)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    // Phone number (optional, unique if provided)
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    // Wallet ID (optional, linked after signup, must remain unique)
    walletId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Password (required for normal signup only)
    password: {
      type: String,
      minlength: 8,
      required: function () {
        return !this.isGoogleUser;
      },
      select: false,
    },

    // Google OAuth ID (present if user signed up via Google)
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Indicates Google-authenticated users
    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    // User avatar/profile picture (optional)
    avatar: {
      type: String,
      required: false,
    },

    // Refresh token for session management
    refreshToken: {
      type: String,
      select: false,
    },

    organisations: [{ type: Schema.Types.ObjectId, ref: "Organisation" }],
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate email usage between Google and normal login
 */
userSchema.pre("validate", async function (next) {
  if (!this.isModified("email")) return next();

  try {
    const existingUser = await mongoose.models.User.findOne({
      email: this.email,
    });

    if (existingUser) {
      if (!this.isGoogleUser && existingUser.isGoogleUser) {
        return next(
          new Error("Email is already registered with Google login.")
        );
      }
      if (this.isGoogleUser && !existingUser.isGoogleUser) {
        return next(
          new Error("Email is already registered with normal login.")
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Hash password before saving (normal users only)
 */
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password && !this.isGoogleUser) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

/**
 * Compare entered password with stored hash
 */
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  if (this.isGoogleUser) {
    return false; // Google users don’t use password login
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate Access Token
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      wallet: this.walletId,
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );
};

/**
 * Generate Refresh Token
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

/**
 * Link a Solana wallet to the user
 * - Ensures uniqueness across users
 * - Prevents overwriting if already linked
 */
userSchema.methods.linkWallet = async function (walletId) {
  if (this.walletId) {
    throw new Error("A Wallet already linked to this account.");
  }

  const existingUser = await mongoose.models.User.findOne({ walletId });
  if (existingUser) {
    throw new Error("This wallet is already linked to another account.");
  }

  this.walletId = walletId;
  await this.save();
  return this;
};

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ walletId: 1 }, { sparse: true });

export const User = mongoose.model("User", userSchema);

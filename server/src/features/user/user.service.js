import { User } from "./user.model.js";
import apiError from "../../utils/apiError.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../constants/httpStatus.js";

export class UserService {
  static async findByEmailOrPhone(email, phoneNumber) {
    return await User.findOne({ $or: [{ phoneNumber }, { email }] });
  }

  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async findByGoogleId(googleId) {
    return await User.findOne({ googleId });
  }

  static async findByEmailOrGoogleId(email, googleId) {
    return await User.findOne({ $or: [{ email }, { googleId }] });
  }

  static async findById(id) {
    return await User.findById(id).select("-password -refreshToken");
  }

  static async createUser(userData) {
    // Remove phoneNumber if it's empty or null to avoid unique constraint issues
    if (!userData.phoneNumber) {
      delete userData.phoneNumber;
    }
    const user = await User.create(userData);
    const { password, refreshToken, ...userWithoutSensitiveData } =
      user.toObject();
    return userWithoutSensitiveData;
  }

  static async updateById(userId, updates) {
    return User.findByIdAndUpdate(userId, updates, { new: true });
  }

  static async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true, validateBeforeSave: false }
    );
  }

  static async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }

  static async generateTokens(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new apiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.USER_NOT_FOUND
        );
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      await this.updateRefreshToken(userId, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new apiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Token generation failed"
      );
    }
  }
}

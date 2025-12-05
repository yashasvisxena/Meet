import { userRepository } from "../repositories/UserRepository.js";
import apiError from "../utils/apiError.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/httpStatus.js";

export class UserService {
  static async findByEmailOrPhone(email, phoneNumber) {
    return await userRepository.findByEmailOrPhone(email, phoneNumber);
  }

  static async findByEmail(email) {
    return await userRepository.findByEmail(email);
  }

  static async findByGoogleId(googleId) {
    return await userRepository.findByGoogleId(googleId);
  }

  static async findByEmailOrGoogleId(email, googleId) {
    return await userRepository.findByEmailOrGoogleId(email, googleId);
  }

  static async findById(id) {
    return await userRepository.findByIdSafe(id);
  }

  static async createUser(userData) {
    return await userRepository.createUser(userData);
  }

  static async updateById(userId, updates) {
    return await userRepository.updateById(userId, updates);
  }

  static async updateRefreshToken(userId, refreshToken) {
    return await userRepository.updateRefreshToken(userId, refreshToken);
  }

  static async clearRefreshToken(userId) {
    return await userRepository.clearRefreshToken(userId);
  }

  static async generateTokens(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new apiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.USER_NOT_FOUND
        );
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      await userRepository.updateRefreshToken(userId, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof apiError) throw error;
      throw new apiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Token generation failed"
      );
    }
  }
}

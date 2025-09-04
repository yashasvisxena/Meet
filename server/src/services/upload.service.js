import { uploadToCloudinary } from "../utils/cloudinary.js";
import apiError from "../utils/apiError.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/httpStatus.js";

export class UploadService {
  static async uploadAvatar(avatarPath) {
    if (!avatarPath) return null;

    try {
      const uploadedAvatar = await uploadToCloudinary(avatarPath);
      if (!uploadedAvatar) {
        throw new apiError(
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.FILE_UPLOAD_ERROR
        );
      }

      return uploadedAvatar.url;
    } catch (error) {
      if (error instanceof apiError) {
        throw error;
      }
      throw new apiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Avatar upload failed"
      );
    }
  }
}

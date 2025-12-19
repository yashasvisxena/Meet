import { asyncHandler } from "../../src/utils/asyncHandler.js";
import apiError from "../../src/utils/apiError.js";
import apiResponse from "../../src/utils/apiResponse.js";
import logger from "../../src/utils/logger.js";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/index.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../src/constants/httpStatus.js";
import { UserService } from "../../src/services/user.service.js";
import { UploadService } from "../../src/services/upload.service.js";


/**
 * @desc Get current user
 * @route GET /api/users/me
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new apiResponse(
        HTTP_STATUS.OK,
        { user: req.user },
        "Current user fetched successfully"
      )
    );
});

/**
 * @desc Register a new user
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.validatedData;

  const existedUser = await UserService.findByEmailOrPhone(email, phoneNumber);
  if (existedUser) {
    throw new apiError(HTTP_STATUS.CONFLICT, ERROR_MESSAGES.USER_EXISTS);
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  const avatar = await UploadService.uploadAvatar(avatarPath);

  const user = await UserService.createUser({
    name,
    email,
    password,
    phoneNumber,
    avatar,
  });

  if (!user) {
    throw new apiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "User registration failed"
    );
  }

  logger.info(`User created successfully with ID: ${user._id}`);

  return res
    .status(HTTP_STATUS.CREATED)
    .json(
      new apiResponse(HTTP_STATUS.CREATED, user, "User registered successfully")
    );
});

/**
 * @desc Login a user
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;
  const user = await UserService.findByEmail(email);

  if (!user) {
    throw new apiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
  }

  const { accessToken, refreshToken } = await UserService.generateTokens(
    user._id
  );
  const loggedInUser = await UserService.findById(user._id);

  if (!loggedInUser) {
    throw new apiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Login failed");
  }

  logger.info(`User logged in successfully with ID: ${user._id}`);

  return res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, config.cookie)
    .cookie("refreshToken", refreshToken, config.cookie)
    .json(
      new apiResponse(
        HTTP_STATUS.OK,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/**
 * @desc Refresh access token
 * @route POST /api/users/refreshAccess
 * @access Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      config.jwt.refreshTokenSecret
    );

    const user = await UserService.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGES.TOKEN_EXPIRED
      );
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGES.TOKEN_EXPIRED
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await UserService.generateTokens(user._id);

    return res
      .status(HTTP_STATUS.OK)
      .cookie("accessToken", accessToken, config.cookie)
      .cookie("refreshToken", newRefreshToken, config.cookie)
      .json(
        new apiResponse(
          HTTP_STATUS.OK,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(
      HTTP_STATUS.UNAUTHORIZED,
      error?.message || ERROR_MESSAGES.TOKEN_EXPIRED
    );
  }
});

/**
 * @desc Logout a user
 * @route POST /api/users/logout
 * @access Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    const decodedToken = jwt.verify(token, config.jwt.accessTokenSecret);
    if (decodedToken?._id) {
      await UserService.clearRefreshToken(decodedToken._id);
    }
  }

  return res
    .status(HTTP_STATUS.OK)
    .clearCookie("accessToken", config.cookie)
    .clearCookie("refreshToken", config.cookie)
    .json(new apiResponse(HTTP_STATUS.OK, {}, "User logged out successfully"));
});

/**
 * @desc Link a wallet to a user
 * @route POST /api/users/linkWallet
 * @access Private
 */
const linkWallet = asyncHandler(async (req, res) => {
  const { walletId } = req.body;

  if (!walletId) {
    throw new apiError(HTTP_STATUS.BAD_REQUEST, "Wallet ID is required");
  }

  const user = await UserService.findById(req.user._id);
  if (!user) {
    throw new apiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  try {
    await user.linkWallet(walletId);
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new apiResponse(
          HTTP_STATUS.OK,
          { walletId: user.walletId },
          "Wallet linked successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      HTTP_STATUS.CONFLICT,
      error.message || "Failed to link wallet"
    );
  }
});

/**
 * @desc Update a user
 * @route PATCH /api/users/patch
 * @access Private
 */
const patchUser = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  let avatar;

  // Handle avatar upload (optional)
  if (req.files?.avatar?.[0]?.path) {
    avatar = await UploadService.uploadAvatar(req.files.avatar[0].path);
  }

  const updates = {};
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (avatar) updates.avatar = avatar;

  if (Object.keys(updates).length === 0) {
    throw new apiError(HTTP_STATUS.BAD_REQUEST, "No valid fields to update");
  }

  const updatedUser = await UserService.updateById(req.user._id, updates);

  if (!updatedUser) {
    throw new apiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to update user details"
    );
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(
      new apiResponse(
        HTTP_STATUS.OK,
        { user: updatedUser },
        "User details updated successfully"
      )
    );
});

export {
  getCurrentUser,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  linkWallet,
  patchUser,
};

import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  linkWallet,
  patchUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";
import passport from "../strategy/google.strategy.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { config } from "../config/index.js";
import apiResponse from "../utils/apiResponse.js";
import { UserService } from "../services/user.service.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    validate(registerSchema),
    registerUser
  );
userRouter.route("/login").post(validate(loginSchema), loginUser);
userRouter.route("/refreshAccess").post(refreshAccessToken);
userRouter.route("/logout").post(logoutUser);

userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      const { accessToken, refreshToken } = await UserService.generateTokens(
        req.user._id
      );

      res
        .status(HTTP_STATUS.OK)
        .cookie("accessToken", accessToken, config.cookie)
        .cookie("refreshToken", refreshToken, config.cookie)
        .json(new apiResponse(HTTP_STATUS.OK, "User logged in successfully"))
        .redirect("http://localhost:5173/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      return res.redirect("http://localhost:5173/login?error=oauth_failed");
    }
  }
);

//Secured Routes
userRouter.route("/me").get(verifyJWT, getCurrentUser);
userRouter.route("/linkWallet").post(verifyJWT, linkWallet);
userRouter.route("/patch").patch(verifyJWT, upload.single("avatar"), patchUser);

export default userRouter;

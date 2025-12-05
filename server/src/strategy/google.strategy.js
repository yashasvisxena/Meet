import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "../services/user.service.js";
import { config } from "../config/index.js";
import apiError from "../utils/apiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserService.findByGoogleId(profile.id);
        if (user) return done(null, user);

        const existingByEmail = await UserService.findByEmail(
          profile.emails[0].value
        );

        if (existingByEmail && !existingByEmail.isGoogleUser) {
          return done(
            new apiError(
              HTTP_STATUS.CONFLICT,
              "Email already registered with password. Please log in with credentials."
            )
          );
        }

        // Step 3: Create new Google user
        user = await UserService.createUser({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleUser: true,
          avatar: profile.photos?.[0]?.value,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;

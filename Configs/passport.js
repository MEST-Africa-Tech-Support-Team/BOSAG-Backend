import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Models/user_mod.js";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email attached"), null);
        }

        const firstName =
          profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
        const lastName =
          profile.name?.familyName ||
          profile.displayName?.split(" ")[1] ||
          "";

        //findOneAndUpdate with upsert to ensure user is created/updated
        let user = await User.findOneAndUpdate(
          { email },
          {
            firstName,
            lastName,
            email,
            provider: "google",
            isVerified: true,
            
          },
          { 
            new: true, 
            upsert: true, 
            setDefaultsOnInsert: true,
            runValidators: true 
          }
        );

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        
        return done(error, null);
      }
    } 
  )
);

export default passport;


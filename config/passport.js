const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/userSchema");
const env = require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      prompt: "consent",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Log profile for debugging
        console.log("Google profile:", JSON.stringify(profile, null, 2));

        // Ensure email exists
        if (!profile.emails || !profile.emails.length) {
          console.error("No email provided in Google profile");
          return done(new Error("Email not provided by Google"), null);
        }

        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update profile picture for existing user using updateOne to avoid validation
          await User.updateOne(
            { email: profile.emails[0].value },
            {
              $set: {
                profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : user.profilePicture,
              },
            }
          );
          return done(null, user);
        } else {
          // Provide robust fallback for name
          const userName = profile.displayName || (profile.emails[0].value ? profile.emails[0].value.split('@')[0] : 'Unknown');

          user = new User({
            name: userName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          });
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        console.error("Error in GoogleStrategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
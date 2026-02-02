import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../modules/users/user.model-mysql.js';
import bcrypt from 'bcryptjs';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // Buscar usuario existente por email o googleId
        let user = await User.findOne({
          where: {
            $or: [
              { email },
              { googleId }
            ]
          }
        });

        if (user) {
          // Si existe y no tiene googleId, vincular OAuth
          if (!user.googleId) {
            await user.update({
              googleId,
              emailVerified: true,
              verificationStatus: 'email_verified'
            });
          }
        } else {
          // Crear nuevo usuario
          const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);
          user = await User.create({
            email,
            name: profile.displayName || profile.name?.givenName || 'Usuario',
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatar: profile.photos[0]?.value,
            googleId,
            password: randomPassword, // Password random para usuarios OAuth
            emailVerified: true,
            verificationStatus: 'email_verified',
            role: 'guest',
            isActive: true
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Error en estrategia de Google OAuth:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;

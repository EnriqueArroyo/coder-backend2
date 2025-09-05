import 'dotenv/config';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import userModel from '../models/userModel.js';
import { cookieExtractor, bearerExtractor } from '../utils/jwt.js';
import { cartRepository } from '../repositories/index.js';

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      session: false
    },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name, age, role } = req.body || {};
        const normEmail = String(email || '').toLowerCase().trim();

        if (!first_name || !last_name || !age || !normEmail || !password) {
          return done(null, false, { message: 'Missing required fields' });
        }

        const exists = await userModel.findOne({ email: normEmail });
        if (exists) return done(null, false, { message: 'Email already in use' });


        const user = await userModel.create({
          first_name,
          last_name,
          email: normEmail,
          age,
          password,
          role
        });

       
        const cartDoc = await cartRepository.createForUser(user._id);
        user.cart = cartDoc._id;
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);


passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false
    },
    async (email, password, done) => {
      try {
        const normEmail = String(email || '').toLowerCase().trim();
        const user = await userModel.findOne({ email: normEmail });
        if (!user) return done(null, false, { message: 'Invalid credentials' });

        const ok = user.isValidPassword(password);
        if (!ok) return done(null, false, { message: 'Invalid credentials' });

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);


const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Missing JWT_SECRET env var');

passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, bearerExtractor]),
      secretOrKey: secret
    },
    async (jwtPayload, done) => {
      try {
        const user = await userModel.findById(jwtPayload.uid).lean();
        if (!user) return done(null, false, { message: 'User not found' });
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;

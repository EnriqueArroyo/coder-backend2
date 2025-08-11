import 'dotenv/config';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userModel from '../models/userModel.js';
import { cookieExtractor, bearerExtractor } from '../utils/jwt.js';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('Missing JWT_SECRET env var');
}

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, bearerExtractor]),
  secretOrKey: secret,
  passReqToCallback: false
};

passport.use(
  'jwt',
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await userModel.findById(jwtPayload.uid).lean();
      if (!user) return done(null, false, { message: 'Suario no encontrado' });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;

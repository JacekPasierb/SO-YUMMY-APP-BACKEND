import passport from "passport";
import passportJWT from "passport-jwt";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user"; // Upewnij się, że importujesz poprawny model
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.SECRET;

if (!secret) {
  throw new Error("SECRET environment variable is not defined");
}

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(
    params,
    async (
      payload: any,
      done: (error: any, user?: any, info?: any) => void
    ) => {
      try {
        const user = await User.findOne({ _id: payload.id });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;

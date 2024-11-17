import { Request, Response, NextFunction } from "express";
import passport from "passport";
import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";

const auth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  console.log("authorization0", authorization);

  passport.authenticate(
    "jwt",
    { session: false },
    (err: unknown, user:IUser) => {
      if (err || !user || user.token !== authorization?.split(" ")[1]) {
        console.log("token", user?.token);
        return next(handleError(401));
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export default auth;
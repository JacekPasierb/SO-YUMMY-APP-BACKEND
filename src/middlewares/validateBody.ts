import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import handleError from "../utils/handleErrors";

const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(handleError(400, error.message));
    }
    next();
  };
};

export default validateBody;

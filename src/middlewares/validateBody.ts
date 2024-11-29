import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import handleError from "../utils/handleErrors";

const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("coo");
    
    const { error } = schema.validate(req.body);
    if (error) {
      console.log("co2",error);
      
      return next(handleError(400, error.message));
    }
    next();
  };
};

export default validateBody;

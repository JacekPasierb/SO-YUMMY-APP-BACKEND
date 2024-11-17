import { Request, Response, NextFunction } from "express";

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const ctrlWrapper = (ctrl: ControllerFunction): ControllerFunction => {
  const func: ControllerFunction = async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };
  return func;
};

export default ctrlWrapper; 
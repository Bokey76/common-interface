import { NextFunction, Request, Response } from "express";

export const testAPI = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.data = 'test api';
  next();
};

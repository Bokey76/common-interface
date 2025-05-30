import { NextFunction, Request, Response } from "express";
import * as authService from "@/services/auth.service";

export const register = async (req: Request, res: Response,next: NextFunction) => {
  const result = await authService.register(req.body);
  res.data = result;
  next()
}

export const login = async(req: Request, res: Response,next: NextFunction) => {
  const result = await authService.login(req.body);
  res.data = result;
  next()
}

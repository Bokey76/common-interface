import { Request, Response, NextFunction } from "express";
import { network } from "@/utils";

/**
 * 返回res.data和res.message的中间件
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns utils.network.ResponseData(res,res.data,res.message)
 */
export const response = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) return next(); // 若已返回就跳过
  network.ResponseData(res, res.data, res.message, res.code);
};

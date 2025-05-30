import { Response } from "express";
/**
 * 响应数据
 * @param res 响应对象
 * @param data 响应的数据
 * @param message 提示消息
 * @param code 响应代码
 * @returns res.json
 */
export const ResponseData = (
  res: Response,
  data: any = {},
  message: string | Object = "Success",
  code: number = 200
) => {
  return res.json({ code, message, data });
};
/**
 * 响应错误信息
 * @param res 响应对象
 * @param message 提示消息
 * @param code 响应代码，默认500
 * @returns res.json
 */
export const ResponseError = (
  res: Response,
  message: string | Object = "Unknown Error",
  code: number = 500
) => {
  if(code < 99 || code > 1000) code = 500;
  return res.status(code).json({ code, message });
};

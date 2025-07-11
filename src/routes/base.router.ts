import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BaseRouteMappings } from "@/config/index";

const router = Router();

// 根据配置文件动态生成开放的router
for (const route of BaseRouteMappings) {
  const {
    method,
    externalPath,
    handler,
    preMiddlewares = [],
    postMiddlewares = [],
    fixedParams = {},
  } = route;
  router[method](
    externalPath,
    ...preMiddlewares,
    async (req: Request, res: Response, next: NextFunction) => {
      req.params = fixedParams as ParamsDictionary; // 注入固定参数
      await handler(req, res, next);
    },
    ...postMiddlewares
  );
}

export default router;

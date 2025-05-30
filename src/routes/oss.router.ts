import { Router, Request, Response, NextFunction } from "express";
import { OSSRouteMappings } from "@/config/index";

const router = Router();

// 根据配置文件动态生成开放的router
for (const route of OSSRouteMappings) {
  const {
    method,
    externalPath,
    handler,
    preMiddlewares = [],
    postMiddlewares = [],
  } = route;
  router[method](
    externalPath,
    ...preMiddlewares,
    async (req: Request, res: Response, next: NextFunction) => {
      await handler(req, res, next);
    },
    ...postMiddlewares
  );
}

export default router;

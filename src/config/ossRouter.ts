import { RequestHandler } from "express";
import * as ossController from "@/controllers/oss.controller";
import * as middlewares from "@/middlewares";
// oss通用接口配置项
interface OSSRouteConfig {
  method: "get" | "post" | "put" | "delete"; // HTTP方法
  externalPath: string; // 路由别名
  handler: RequestHandler; // 使用的控制器
  preMiddlewares: RequestHandler[]; // 前置中间件数组
  postMiddlewares: RequestHandler[]; // 后置中间件数组
}

// oss通用接口配置列表
export const OSSRouteMappings: OSSRouteConfig[] = [
  {
    method: "get",
    externalPath: "/getFilesByDir",
    handler: ossController.getFilesByDir,
    preMiddlewares: [
      middlewares.auth.authJudgeFactory({}),
      middlewares.base.changeOrCheckRequestPayloadFactory({
        checkFields: {
          "req.query.dir": [
            "temp/",
            /^temp\/[^/]+\/article$/,
            (value, req: Record<string, any>) =>
              value === `temp/${req.user?.id}/articles`,
          ],
        },
      }),
    ],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "get",
    externalPath: "/getFileContent",
    handler: ossController.getFileContent,
    preMiddlewares: [
      middlewares.auth.authJudgeFactory({}),
      middlewares.base.changeOrCheckRequestPayloadFactory({
        checkFields: {
          "req.query.objectKey": [
            "article/",
            /^\/temp\/.*$/,
            (value, req: Record<string, any>) =>
              value === `articles/${req.user?.id}/`,
          ],
        },
      }),
    ],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "get",
    externalPath: "/getOssSignature",
    handler: ossController.getOssSignature,
    preMiddlewares: [
      // middlewares.auth.authJudgeFactory({}),
      middlewares.base.changeOrCheckRequestPayloadFactory({
        checkFields: {
          "req.query.objectKey": [
            "article/",
            /^\/temp\/.*$/,
            (value, req: Record<string, any>) =>
              value === `articles/${req.user?.id}/`,
          ],
        },
      }),
      middlewares.base.limitRequestPayloadFactory({
        replaceFields: {
          originalNameOrNot: false,
          expireTime: 600,
          conditions: undefined,
        },
      }),
    ],
    postMiddlewares: [middlewares.network.response],
  },
];

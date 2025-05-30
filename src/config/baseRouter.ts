import { RequestHandler } from "express";
import * as baseController from "@/controllers/base.controller";
import * as middlewares from "@/middlewares";

// 通用接口配置项
interface BaseRouteConfig {
  method: "get" | "post" | "put" | "delete"; // HTTP方法
  externalPath: string; // 路由别名
  handler: RequestHandler; // 使用的控制器
  fixedParams?: { MainModel: string; RelevanceModels?: string[] | string }; // 内部通用路由需要的params参数数组
  preMiddlewares: RequestHandler[]; // 前置中间件数组
  postMiddlewares: RequestHandler[]; // 后置中间件数组
}

// 通用接口配置列表
export const BaseRouteMappings: BaseRouteConfig[] = [
  {
    method: "get",
    externalPath: "/getAllUser",
    handler: baseController.getAll,
    fixedParams: { MainModel: "User" },
    preMiddlewares: [],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "get",
    externalPath: "/getAllCommentByUser",
    handler: baseController.getAll,
    fixedParams: { MainModel: "Comment", RelevanceModels: ["User"] },
    preMiddlewares: [
      middlewares.base.limitRequestPayloadFactory({
        deleteFields: ["limitAttributes", "where.popularity"],
        deleteAttributes: ["userId", "content"],
      }),
    ],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "post",
    externalPath: "/createComment",
    handler: baseController.create,
    fixedParams: { MainModel: "Comment" },
    preMiddlewares: [
      middlewares.auth.authJudgeFactory({
        roleCheck: ["Super Admin"],
        permissionCheck: [
          {
            name: "Super Admin",
            action: "CREATE",
            resource: "Comment"
          },
        ],
      }),
      middlewares.base.limitRequestPayloadFactory({
        deleteFields: ["popularity"],
      }),
      middlewares.base.changeOrCheckRequestPayloadFactory({
        changeFields: {
          userId: "req.user.id",
        },
      }),
    ],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "put",
    externalPath: "/relevanceArticleToTag",
    handler: baseController.relevance,
    fixedParams: { MainModel: "Tag", RelevanceModels: "Article" },
    preMiddlewares: [],
    postMiddlewares: [middlewares.network.response],
  },
  {
    method: "delete",
    externalPath: "/deleteComment",
    handler: baseController.deleteAll,
    fixedParams: { MainModel: "Comment" },
    preMiddlewares: [],
    postMiddlewares: [middlewares.network.response],
  },
];

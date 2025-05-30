import express, { Request, Response, NextFunction } from "express";
import routes from "@/routes";
import cors from "cors";
import "@/models"; // 引入模型定义
import { error, network, format } from "@/utils";

const app = express();
// 跨域，按照需要使用
// app.use(cors()); // 普通跨域
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        format.deepSmartParse(process.env.CORS_WHITE_LIST)?.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new error.CustomError("未在CORS白名单中❌"));
      }
    },
    credentials: true, // 如果你需要支持 cookie
  })
); // 跨域白名单配置
app.use(express.json());

// 应用路由
app.use("/", routes);

// 错误处理中间件
app.use(
  (err: error.CustomError, req: Request, res: Response, next: NextFunction) => {
    network.ResponseError(res, err.message, err.status);
  }
);

export default app;

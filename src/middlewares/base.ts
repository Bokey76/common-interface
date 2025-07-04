import { get } from "lodash";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { format, error } from "@/utils";

/**
 * 中间件工厂：用于限制请求的 query 和 body 中的字段内容，并支持字段替换、删除和属性过滤。
 *
 * 功能：
 * 1. 删除字段（deleteFields）：
 *    - 从 req.query、req.body 中删除指定路径的字段（支持嵌套路径，例如：user.password）
 *
 * 2. 替换字段（replaceFields）：
 *    - 向 req.query、req.body 中写入或更新指定字段的值（支持嵌套路径）
 *
 * 3. 属性排除（deleteAttributes）：
 *    - 用于过滤 req.filteredQuery.attributes，支持以下形式：
 *      - 如果 attributes 是数组，则直接过滤指定字段
 *      - 如果 attributes 是对象，则自动加入 exclude 字段中
 *
 * 特别说明：
 * - 对 req.query 的修改结果会保存在 req.filteredQuery 中，原始 req.query 保留不变
 * - 支持对 req.body 是数组的情况，逐个 item 进行处理
 *
 * 参数：
 * @param deleteFields - 要从请求中删除的字段路径数组，如 ['user.password', 'meta.secret']
 * @param replaceFields - 要在请求中设置或更新的字段键值对，如 { 'user.role': 'member' }
 * @param deleteAttributes - 要从 req.query.attributes 中排除的字段名，如 ['password', 'secret']
 *
 * 示例用法：
 * ```ts
 * limitRequestPayloadFactory({
 *   deleteFields: ['user.password'],
 *   replaceFields: { 'user.role': 'member' },
 *   deleteAttributes: ['password']
 * })
 * ```
 *
 * 返回：
 * @returns Express 中间件函数
 */
export const limitRequestPayloadFactory = ({
  deleteFields = [],
  replaceFields = {},
  deleteAttributes = [],
}: {
  deleteFields?: string[];
  replaceFields?: Record<string, any>;
  deleteAttributes?: string[];
}): RequestHandler => {
  // 应用过滤函数
  const applyFilter = (target: Record<string, any>) => {
    if (!target) return target;
    // 处理删除字段
    for (const path of deleteFields) {
      const keys = format.smartSplit(path);
      let current = target;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          delete current[key];
        } else {
          if (current[key] === undefined) break;
          current = current[key];
        }
      }
    }
    // 处理替换字段
    for (const [path, value] of Object.entries(replaceFields)) {
      const keys = format.smartSplit(path);
      let current = target;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      }
    }
    return target;
  };
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.query) {
      req.filteredQuery = applyFilter(format.deepSmartParse(req.query));
      if (deleteAttributes && deleteAttributes.length > 0) {
        // 过滤req.query的attribute
        if (!req.filteredQuery.attributes) {
          // 初始化为空的 exclude 对象
          req.filteredQuery.attributes = { exclude: [] };
        }
        for (const deleteAttribute of deleteAttributes) {
          const attrs = req.filteredQuery.attributes;
          if (Array.isArray(attrs)) {
            // 如果是数组形式，直接过滤掉目标字段
            req.filteredQuery.attributes = attrs.filter(
              (item) => item !== deleteAttribute
            );
          } else if (typeof attrs === "object" && attrs !== null) {
            // 如果是对象形式，排除字段添加进 exclude 数组
            if (!Array.isArray(attrs.exclude)) {
              attrs.exclude = [];
            }
            if (!attrs.exclude.includes(deleteAttribute)) {
              attrs.exclude.push(deleteAttribute);
            }
          }
        }
      }
    }
    if (req.body) {
      if (Array.isArray(req.body)) {
        for (let item of req.body) {
          applyFilter(item);
        }
      } else {
        applyFilter(req.body);
      }
    }
    next();
  };
};

/**
 * 中间件工厂：用于检查或修改请求参数（query/body）中的字段。
 *
 * 功能：
 * 1. 检查字段（checkFields）：
 *    - 对 req.query 或 req.body 中的字段进行校验
 *    - 支持以下校验方式：
 *       - 字符串：字段值必须等于某个字符串
 *       - 正则表达式：字段值必须匹配正则
 *       - 函数：(value, req) => boolean，返回 true 表示合法
 *       - 数组：上述类型的任意组合，满足其中一个即为合法
 *
 * 2. 替换字段（changeFields）：
 *    - 将 req 中指定的值赋值到 req.body 或 req.filteredQuery 中的目标字段
 *    - 支持对整个 req.body 是数组的情况，逐个设置字段
 *
 * 参数：
 * @param changeFields - 替换字段的映射关系，例如：
 *    {
 *      "userId": "req.user.id" // 将 req.user.id 写入 req.body.userId 和 req.filteredQuery.userId
 *    }
 *
 * @param checkFields - 校验字段及其合法性规则，例如：
 *    {
 *      "req.query.dir": [
 *        "temp/",
 *        /^temp\/[^/]+\/article$/,
 *        (val, req: Record<string, any>) => val === `temp/${req.user.id}/articles`
 *      ]
 *    }
 *
 * 使用场景举例：
 * - 限制查询路径必须是某些前缀或与当前用户相关
 * - 自动将当前登录用户 ID 写入请求体
 *
 * 返回值：
 * @returns Express 中间件函数
 */
export const changeOrCheckRequestPayloadFactory = ({
  changeFields = {},
  checkFields = {},
}: {
  changeFields?: Record<string, string>;
  checkFields?: Record<
    string,
    | string
    | RegExp
    | Array<string | RegExp | ((value: any, req: Request) => boolean)>
    | ((value: any, req: Request) => boolean)
  >;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Object.entries(checkFields).forEach(([checkField, sourceValue]) => {
      // 检查函数
      const check = (value: any) => {
        const validators = Array.isArray(sourceValue)
          ? sourceValue
          : [sourceValue]; // 统一成数组，方便遍历
        const isValid = validators.some((rule) => {
          if (typeof rule === "function") {
            return rule(value, req);
          }
          if (rule instanceof RegExp) {
            return rule.test(value);
          }
          return rule === value;
        });
        if (!isValid) {
          error.throwError(`字段 ${checkField} 被限制，不允许是该值`);
        }
      };
      if (
        req.query &&
        !checkField.startsWith("req.body") &&
        Object.keys(req.query).length > 0
      ) {
        const value = get(
          req,
          checkField.startsWith("req.") ? checkField.slice(4) : checkField
        ); // 获取 req.xxx 的数据
        check(value);
      }
      if (
        req.body &&
        !checkField.startsWith("req.query") &&
        Object.keys(req.body).length > 0
      ) {
        check(req.body[checkField]);
      }
    });
    Object.entries(changeFields).forEach(([targetField, sourceValue]) => {
      const value = get(
        req,
        sourceValue.startsWith("req.") ? sourceValue.slice(4) : sourceValue
      ); // 获取 req.xxx 的数据
      if (value !== undefined) {
        if (req.body) {
          if (Array.isArray(req.body)) {
            for (let item of req.body) {
              item[targetField] = value;
            }
          } else {
            req.body[targetField] = value;
          }
        }
        if (!req.filteredQuery) req.filteredQuery = {};
        req.filteredQuery[targetField] = value;
      }
    });
    next();
  };
};

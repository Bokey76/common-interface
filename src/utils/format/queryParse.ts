import { Op } from "sequelize";
import { Request } from "express";
import { format } from "@/utils";

// Sequelize的Op字段映射
const opMap: Record<string, symbol> = {
  "Op.eq": Op.eq, // 等于（=）
  "Op.ne": Op.ne, // 不等于（<>）
  "Op.gt": Op.gt, // 大于（>）
  "Op.gte": Op.gte, // 大于等于（>=）
  "Op.lt": Op.lt, // 小于（<）
  "Op.lte": Op.lte, // 小于等于（<=）
  "Op.like": Op.like, // 模糊匹配 LIKE（区分大小写）
  "Op.notLike": Op.notLike, // NOT LIKE（不匹配）
  "Op.in": Op.in, // 在某个集合中（IN）
  "Op.or": Op.or, // 或条件（OR）
  "Op.and": Op.and, // 与条件（AND）
};

/**
 * 解析对象中的Sequelize的Op键
 * @param obj 待解析的含Sequelize Op字段的对象
 * @returns 替换了Op为Sequelize Op的对象
 */
export function replaceOpKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(replaceOpKeys);
  } else if (typeof obj === "object" && obj !== null) {
    const result: Record<string | symbol, any> = {};
    for (const key in obj) {
      const newKey = opMap[key] ?? key;
      result[newKey] = replaceOpKeys(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * 获取JSON格式的Query
 * - 判断filteredQuery是否存在，若存在就返回
 * - 若不存在，使用format.deepSmartParse解析req.query，返回req.query的JSON格式
 * @param req 请求的req对象
 * @returns 返回filteredQuery ? filteredQuery : req.query的JSON格式
 */
export function getJSONQuery(req:Request) {
  let jsonQuery = null;
  if (!req.filteredQuery) {
    jsonQuery = format.deepSmartParse(req.query);
  } else {
    jsonQuery = req.filteredQuery;
  }
  return jsonQuery
}

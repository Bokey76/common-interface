import { NextFunction, Request, Response } from "express";
import { sequelize, Sequelize } from "@/database";
import { Model } from "sequelize";
const Models = sequelize.models; // 所有sequelize注册model的集合
import * as baseService from "@/services/base.service";
import { format, error } from "@/utils";

// #region --获取--
// 普通查询 / 普通关联查询
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    limitAttributes,
    limitRequired,
    limitedWhere,
    limitThrough,
    page,
    order,
    attributes,
    where,
  } = format.getJSONQuery(req);
  const include: Array<Object> = []; // include数据
  if (req.params.RelevanceModels && Array.isArray(req.params.RelevanceModels)) {
    let relevanceModelIndex = 0;
    for (const relevanceModel of req.params.RelevanceModels) {
      include.push({
        model: Models[relevanceModel as keyof typeof Models],
        ...(!limitAttributes && { attributes: [] }),
        ...(!limitThrough && { through: { attributes: [] } }),
        ...{ required: limitRequired },
        where: format.replaceOpKeys(limitedWhere?.[relevanceModelIndex]) || {},
      });
      relevanceModelIndex++;
    }
  }
  // order数据处理，若大于两项添加表名
  let orderData;
  if (order && Array.isArray(order)) {
    orderData = order.map((orderItems: string[]) => {
      const result: (string | typeof Model)[] = [];
      // 若大于2，那么前面的都是是表名，最后两个才是字段和排序方式
      while (orderItems.length > 2) {
        result.push((Models as Record<string, typeof Model>)[orderItems[0]]);
        orderItems.shift();
      }
      result.push(...orderItems);
      return result;
    });
  }
  const result = await baseService.getAll({
    MainModel: req.params.MainModel,
    page: page,
    where: format.replaceOpKeys(where),
    order: orderData,
    attributes: attributes,
    include: include,
  });
  res.data = result;
  next();
};

// 递归关联查询
export const getAllRelevance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    limitAttributes,
    limitRequired,
    limitedWhere,
    limitThrough,
    page,
    order,
    attributes,
    where,
  } = format.getJSONQuery(req);
  let include: any = undefined; // include数据
  if (req.params.RelevanceModels && Array.isArray(req.params.RelevanceModels)) {
    let relevanceModelIndex = req.params.RelevanceModels.length;
    for (const relevanceModel of (req.params.RelevanceModels as Array<string>)
      .slice()
      .reverse()) {
      let currentLimitedWhere;
      if (limitedWhere && Array.isArray(limitedWhere)) {
        currentLimitedWhere = format.replaceOpKeys(
          limitedWhere?.slice().reverse()[relevanceModelIndex]
        );
      }
      include = {
        model: (Models as Record<string, typeof Model>)[relevanceModel],
        ...(!limitAttributes && { attributes: [] }),
        ...(!limitThrough && { through: { attributes: [] } }),
        ...{ required: limitRequired },
        where: currentLimitedWhere || {},
        include: include ? [include] : [],
      };
      relevanceModelIndex--;
    }
  }
  // order数据处理，若大于两项添加表名
  let orderData;
  if (order && Array.isArray(order)) {
    orderData = order.map((orderItems: string[]) => {
      const result: (string | typeof Model)[] = [];
      // 若大于2，那么前面的都是是表名，最后两个才是字段和排序方式
      while (orderItems.length > 2) {
        result.push((Models as Record<string, typeof Model>)[orderItems[0]]);
        orderItems.shift();
      }
      result.push(...orderItems);
      return result;
    });
  }
  const result = await baseService.getAll({
    MainModel: req.params.MainModel,
    page: page,
    where: format.replaceOpKeys(where),
    order: orderData,
    attributes: attributes,
    include: [include],
  });
  res.data = result;
  next();
};

// #endregion
//  #region --创建--
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await baseService.create({
    MainModel: req.params.MainModel,
    data: req.body,
    bulk: Array.isArray(req.body),
  });
  res.data = result;
  next();
};
// #endregion
// #region --修改--
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const where = req.body.where;
  delete req.body.where;
  const [affectedCount] = await baseService.update({
    MainModel: req.params.MainModel,
    data: req.body,
    where: where,
  });
  res.data = {
    affectedCount: affectedCount,
  };
  next();
};

// 关联
export const relevance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sourceInstance = await Models[req.params.MainModel].findByPk(
    req.body.id
  );
  if (!sourceInstance) {
    error.throwError("主表关联数据不存在❌");
  }
  const result = await baseService.relevance({
    sourceInstance,
    targetAlias: req.params.RelevanceModels,
    data: req.body.data,
    ids: req.body.ids,
  });
  res.data = result;
  next();
};
// #endregion

// #region --删除--
export const deleteAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { where, force } = format.getJSONQuery(req);
  const result = await baseService.deleteAll({
    MainModel: req.params.MainModel,
    where: format.replaceOpKeys(where),
    ...(!force && { force: true }),
  });
  res.data = result;
  next();
};
// #endregion

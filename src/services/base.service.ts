import { sequelize, Sequelize } from "@/database";
import { Model, WhereOptions } from "sequelize";
const Models = sequelize.models; // 所有sequelize注册model的集合
import { AllSearchParams } from "@/interface";
import { error } from "@/utils";

// 获取
export const getAll = async ({
  MainModel,
  page,
  where,
  order,
  attributes,
  include,
}: AllSearchParams) => {
  const options: any = {
    ...(page && {
      limit: page.pageSize || 10,
      offset: ((page.currentPage || 1) - 1) * (page.pageSize || 10),
    }),
    ...(where && { where }),
    ...(order && { order }),
    ...(attributes && { attributes }),
    ...(include && { include }),
  };
  if(options.limit !== undefined&& options.offset !== undefined) {
    const result = await Models[MainModel].findAndCountAll(options);
    return {
      list: result.rows,
      total: result.count
    }
  } else {
    return await Models[MainModel].findAll(options);
  }
};

// 创建
export const create = async ({
  MainModel,
  data,
  bulk = false,
}: {
  MainModel: string;
  data: Record<string, any> | any[];
  bulk?: boolean;
}) => {
  let result = null;
  if (bulk) {
    result = await Models[MainModel].bulkCreate(data as any[]);
  } else {
    result = await Models[MainModel].create(data as Record<string, any>);
  }
  return result;
};

// 修改
export const update = async ({
  MainModel,
  data,
  where,
}: {
  MainModel: string;
  data: Object;
  where: WhereOptions;
}) => {
  const result = await Models[MainModel].update(data, {
    ...(where && { where }),
  });
  return result;
};

// 分配
/**
 * 多对多分配
 * @param {Object} 参数：{ sourceInstance 分配实例（findByPk后的结果）,targetAlias（副表别名，大写开头）, targets（分配的数据） }
 */
export const relevance = async ({
  sourceInstance,
  targetAlias,
  ids,
  data,
}: {
  sourceInstance: Model;
  targetAlias: string;
  ids: Array<Number>;
  data: Array<any>;
}) => {
  const methodName = `set${targetAlias}s`; // 动态sequelize的多对多set()
  const fn = (sourceInstance as any)[methodName];
  if (typeof fn !== "function") {
    error.throwError(`方法${methodName}未找到❌`);
  }
  // 动态调用sequelize的多对多set()
  const result = await fn.call(sourceInstance, ids, { through: data });
  return result;
};

// 删除
export const deleteAll = async ({
  MainModel,
  where,
  force = false,
}: {
  MainModel: string;
  where: WhereOptions;
  force?: boolean;
}) => {
  const result = await Models[MainModel].destroy({
    where,
    force,
  });
  return result;
};

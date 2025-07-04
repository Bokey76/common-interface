import { Request, Response, NextFunction } from "express";
import { jwt, error } from "@/utils";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "@/models";
/**
 * @function authJudgeFactory
 * @description 生成通用的权限认证中间件，适用于 Express 路由。支持基于用户角色（Role）和权限（Permission）的双重校验机制。
 * 
 * @param {Object} options - 配置对象
 * @param {Array<string>} [options.roleCheck] - 指定允许访问该接口的角色名称数组，若用户的角色与其中任意一个匹配，则通过校验
 * @param {Array<Object>} [options.permissionCheck] - 指定更细粒度的权限校验条件，数组中的任意一项匹配即通过
 * @param {string} [options.permissionCheck[].name] - 权限名称，可选，若不传表示忽略名称匹配
 * @param {string} [options.permissionCheck[].action] - 操作类型，可选，支持通配符 "*" 表示任意操作
 * @param {string} [options.permissionCheck[].resource] - 资源标识，可选，支持通配符 "*" 表示任意资源
 * 
 * @returns {Function} Express 中间件函数，自动校验登录用户信息、角色权限与具体操作权限
 * 
 * @example
 * // 仅限管理员角色访问
 * router.post('/admin/data', authJudgeFactory({ roleCheck: ['admin'] }), handler);
 * 
 * @example
 * // 需要具体权限才能操作
 * router.delete('/product/:id', authJudgeFactory({
 *   permissionCheck: [{ action: 'delete', resource: 'product' }]
 * }), handler);
 * 
 * @note
 * - 中间件自动解析 Authorization 头中的 Bearer Token，校验登录状态
 * - 校验通过后，将用户信息挂载至 req.user
 * - 校验失败抛出自定义错误，交由统一错误处理中间件处理
 */

export const authJudgeFactory = ({
  roleCheck,
  permissionCheck,
}: {
  roleCheck?: Array<string>;
  permissionCheck?: Array<{
    name?: string;
    action?: string;
    resource?: string;
  }>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) error.throwError("无登录令牌，请登录❌", 401);
    try {
      const decodedToken = jwt.verifyToken(token) as JwtPayload;
      const user = await auth.User.findOne({
        where: decodedToken.userId,
        include: [
          {
            model: auth.Role,
            through: {
              attributes: [],
            },
            include: [
              {
                model: auth.Permission,
                through: {
                  attributes: [],
                },
              },
            ],
          },
        ],
      });
      if (!user) error.throwError(`该登录令牌无对应用户，无效❌`, 401);
      req.user = user.get({ plain: true }); // 将登录身份嵌入req.user
      // 检查role层权限
      if (roleCheck && Array.isArray(roleCheck) && req.user) {
        const roles = req.user.Roles;
        const roleCheckResult = roleCheck.some((checkRole) =>
          roles.map((role: auth.Role) => role.name).includes(checkRole)
        );
        if (!roleCheckResult)
          error.throwError("您的角色无权限进行该操作❌", 403);
      }
      // 检查permission层权限
      if (permissionCheck && Array.isArray(permissionCheck) && req.user) {
        const roles = req.user.Roles;
        // 收集所有用户拥有的权限（合并多个角色）
        const userPermissions: Array<{
          name?: string;
          action?: string;
          resource?: string;
        }> = roles.flatMap((role: any) => role.Permissions || []);
        const permissionCheckResult = permissionCheck.some((required) => {
          return userPermissions.some((userPerm) => {
            const matchName = !required.name || required.name === userPerm.name;
            const matchAction =
              !required.action ||
              required.action === "*" ||
              userPerm.action === "*" ||
              required.action === userPerm.action;
            const matchResource =
              !required.resource ||
              required.resource === "*" ||
              userPerm.resource === "*" ||
              required.resource === userPerm.resource;
            return matchName && matchAction && matchResource;
          });
        });
        console.log("permissionCheckResult", permissionCheckResult);
        if (!permissionCheckResult) {
          error.throwError("您没有所需的权限，无法进行此操作❌", 403);
        }
      }
      next();
    } catch (err) {
      if (err instanceof error.CustomError) {
        next(err); // 若是我抛出的错误，交由统一错误处理中间件
      }
      error.throwError(`无效的登录令牌❌${err}`, 401);
    }
  };
};

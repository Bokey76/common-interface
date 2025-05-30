import { Request, Response, NextFunction } from "express";
import { jwt, error } from "@/utils";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "@/models";
/**
 * token验证中间件函数工厂，验证token，将token内容放入req.user中
 * @param param 参数留白，根据需要添加（eg：权限类型：管理员or普通用户）
 * @returns token验证中间件
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

import { Optional } from "sequelize";

export interface IRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

export interface IRolePermissionCreationAttributes
  extends Optional<IRolePermission, "id"> {}

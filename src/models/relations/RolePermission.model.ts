import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IRolePermission, IRolePermissionCreationAttributes } from "@/interface/models";

export class RolePermission
  extends Model<IRolePermission, IRolePermissionCreationAttributes>
  implements IRolePermission
{
  public id!: string;
  public roleId!: string;
  public permissionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.BIGINT,
    },
    permissionId: {
      type: DataTypes.BIGINT,
    },
  },
  {
    sequelize,
    tableName: "role_permissions",
    timestamps: true,
  }
);

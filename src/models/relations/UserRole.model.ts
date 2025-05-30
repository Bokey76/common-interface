import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IUserRole, IUserRoleCreationAttributes } from "@/interface/models";

export class UserRole
  extends Model<IUserRole, IUserRoleCreationAttributes>
  implements IUserRole
{
  public id!: string;
  public userId!: string;
  public roleId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    roleId: {
      type: DataTypes.BIGINT,
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: true,
  }
);

import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import {
  IPermission,
  IPermissionCreationAttributes,
} from "@/interface/models/";

export class Permission
  extends Model<IPermission, IPermissionCreationAttributes>
  implements IPermission
{
  public id!: string;
  public name!: string;
  public description!: string;
  public action!: string;
  public resource!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    action: {
      type: DataTypes.STRING,
    },
    resource: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "permissions",
    timestamps: true,
  }
);

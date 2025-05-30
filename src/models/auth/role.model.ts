import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IRole, IRoleCreationAttributes } from "@/interface/models/";
import { Permission } from "@/models";

export class Role
  extends Model<IRole, IRoleCreationAttributes>
  implements IRole
{
  public id!: string;
  public name!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public Permissions?: Permission[];
}

Role.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
  }
);

import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IUser, IUserCreationAttributes } from "@/interface/models/";
import { Role } from "@/models";

export class User
  extends Model<IUser, IUserCreationAttributes>
  implements IUser
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public Roles?: Role[];

  public setRoles!: (roles: Role[] | string[]) => Promise<void>;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

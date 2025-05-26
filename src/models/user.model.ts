import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

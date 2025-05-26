import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";

export interface CommentAttributes {
  id: number;
  title: string;
  content: string;
  userId: number;
}

export interface CommentCreationAttributes
  extends Optional<CommentAttributes, "id"> {}

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "comment",
    timestamps: true,
  }
);

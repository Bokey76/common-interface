import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import {
  IComment,
  ICommentCreationAttributes,
} from "@/interface/models";

export class Comment
  extends Model<IComment, ICommentCreationAttributes>
  implements IComment
{
  public id!: string;
  public title!: string;
  public content!: string;
  public userId!: string;
  public popularity!: number;
  public articleId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    popularity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    articleId: {
      type: DataTypes.BIGINT,
    }
  },
  {
    sequelize,
    tableName: "comments",
    timestamps: true,
  }
);

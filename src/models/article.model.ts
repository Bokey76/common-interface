import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IArticle, IArticleCreationAttributes } from '@/interface/models'

export class Article
  extends Model<IArticle, IArticleCreationAttributes>
  implements IArticle
{
  public id!: string;
  public title!: string;
  public content!: string;
  public userId!: string;
  public popularity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
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
  },
  {
    sequelize,
    tableName: "articles",
    timestamps: true,
  }
);

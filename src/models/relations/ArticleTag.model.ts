import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { IArticleTag, IArticleTagCreationAttributes } from "@/interface/models";

export class ArticleTag
  extends Model<IArticleTag, IArticleTagCreationAttributes>
  implements IArticleTag
{
  public id!: string;
  public articleId!: string;
  public tagId!: string;
  public note!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ArticleTag.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    articleId: DataTypes.BIGINT,
    tagId: DataTypes.BIGINT,
    note: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "article_tags",
    timestamps: true,
  }
);

import { Optional } from "sequelize";

export interface IArticleTag {
  id: string;
  articleId: string;
  tagId: string;
  note: string;
}

export interface IArticleTagCreationAttributes
  extends Optional<IArticleTag, "id"> {}

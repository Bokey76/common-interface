import { Optional } from "sequelize";

export interface IArticle {
  id: string;
  title: string;
  content: string;
  userId: string;
  popularity: number;
}

export interface IArticleCreationAttributes
  extends Optional<IArticle, "id"> {}
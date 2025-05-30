import { Optional } from "sequelize";

export interface IComment {
  id: string;
  title: string;
  content: string;
  userId: string;
  articleId: string;
  popularity: number;
}

export interface ICommentCreationAttributes
  extends Optional<IComment, "id"> {}
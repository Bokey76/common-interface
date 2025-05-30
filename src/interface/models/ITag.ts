import { Optional } from "sequelize";

export interface ITag {
  id: string;
  name: string;
}

export interface ITagCreationAttributes
  extends Optional<ITag, "id"> {}
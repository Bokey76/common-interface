import { Optional } from "sequelize";
import { Permission } from "@/models";

export interface IRole {
  id: string;
  name: string;
  description: string;

  Permissions?:Permission[];
}

export interface IRoleCreationAttributes
  extends Optional<IRole, "id"> {}
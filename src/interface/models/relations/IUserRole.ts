import { Optional } from "sequelize";

export interface IUserRole {
  id: string;
  userId: string;
  roleId: string;
}

export interface IUserRoleCreationAttributes
  extends Optional<IUserRole, "id"> {}

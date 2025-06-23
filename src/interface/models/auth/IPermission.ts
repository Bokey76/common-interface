import { Optional } from "sequelize";

export interface IPermission {
  id: string;
  name: string;
  description: string;
  action: string;
  resource: string;
}

export interface IPermissionCreationAttributes
  extends Optional<IPermission, "id"> {}
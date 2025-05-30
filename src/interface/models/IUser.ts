import { Optional } from "sequelize";
import { Role } from "@/models";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;

  Roles?: Role[];
}

export interface IUserCreationAttributes extends Optional<IUser, "id"> {}

import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/database";
import { ITag, ITagCreationAttributes } from '@/interface/models/'

export class Tag
  extends Model<ITag, ITagCreationAttributes>
  implements ITag
{
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: true,
  }
);

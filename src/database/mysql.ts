import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: console.log, // ✅ 打印所有执行的 SQL 语句
    // logging: false
  }
);

export { Sequelize, sequelize };

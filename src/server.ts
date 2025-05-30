import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import { sequelize } from "./database";
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ mysql connected");
    await sequelize.sync({ force: false, alter: false }); // force - 删除旧表，重新建新表  alter - 尝试根据模型差异自动修改表结构（不删除数据，但可能出错）
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at port:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to mysql:", error);
  }
})();

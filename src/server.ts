import dotenv from 'dotenv';
dotenv.config();
import app from './app';

import { sequelize } from './database';
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ mysql connected');
    await sequelize.sync({alter: true}); // 自动创建或更新表结构
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at port:${process.env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to mysql:', error);
  }
})();

import express from 'express';
import './models' // 引入模型定义

const app = express();
app.use(express.json());

import routes from './routes';
app.use('/', routes);

export default app;

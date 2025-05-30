// 通用接口测试router
import { Router } from "express";
import * as baseController from "@/controllers/base.controller";
import { network } from "@/middlewares";

const router = Router();
// --查询--
// 普通查询 / 普通关联查询
router.get(
  `/all/:MainModel{/*RelevanceModels}`,
  baseController.getAll,
  network.response
);
router.get(
  `/allRelevance/:MainModel{/*RelevanceModels}`,
  baseController.getAllRelevance,
  network.response
);

// --创建--
router.post(`/create/:MainModel`, baseController.create, network.response);

// --修改--
router.put(`/update/:MainModel`, baseController.update, network.response);
router.put(
  `/relevance/:MainModel/:RelevanceModels`,
  baseController.relevance,
  network.response
);

// --删除--
router.delete(`/delete/:MainModel`, baseController.deleteAll, network.response);

export default router;

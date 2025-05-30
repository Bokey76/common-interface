import { Router } from "express";
import * as authController from "@/controllers/auth.controller";
import { network } from "@/middlewares";

const router = Router();

router.post(`/register`, authController.register, network.response);
router.post(`/login`, authController.login, network.response);

export default router;

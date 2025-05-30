import { Router} from "express";
import { network } from "@/middlewares";
import * as test from '@/controllers/test.controller'

const router = Router();

router.get('/testAPI',test.testAPI,network.response)

export default router;
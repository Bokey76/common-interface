import { Router } from 'express';
import baseController from '../controllers/base.controller'
import middlewares from '@/middlewares';

const router = Router();

router.get(`/all/:MainModel`,baseController.getAll,middlewares.network.response)
router.post(`/create/:MainModel`,baseController.create,middlewares.network.response)

export default router;
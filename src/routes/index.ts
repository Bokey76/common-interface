import { Router } from 'express';
import base from './base.router'

const router = Router();

router.get('/', (req,res) => {
    res.json(`👀Hi,welcome`)
});
router.use('/base',base)

export default router;

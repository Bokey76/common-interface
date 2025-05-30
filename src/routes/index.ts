import { Router } from 'express';
import base from './base.router'
import auth from './auth.router'
import test from './test.router'
import oss from './oss.router'
import { base as internalBaseRouter} from './internal'
import { oss as internalOSSRouter} from './internal'

const router = Router();

router.get('/', (req,res) => {
    res.json(`👀Hi,welcome`)
});
router.use('/base',base)
router.use('/auth',auth)
router.use('/oss',oss)
router.use('/test',test)
router.use('/baseInternal',internalBaseRouter) // 内部测试通用接口router，正式环境请注释
router.use('/ossInternal',internalOSSRouter) // 内部测试通用oss接口router，正式环境请注释

export default router;

import { NextFunction, Request, Response } from 'express';
import baseService from '../services/base.service'

export default {

    // 获取
    getAll: async (req:Request,res:Response,next:NextFunction) => {
        console.log(req.params.MainModel);
        
        
        const result = await baseService.getAll(req.params.MainModel)
        console.log(result);
        res.data = result
        next()
    },


    // 创建
    create: async (req:Request,res:Response,next:NextFunction) => {
        const result = await baseService.create(req.params.MainModel,req.body)
        console.log(result);
        res.data = result
        next()
    },


    // 修改


    // 删除

}